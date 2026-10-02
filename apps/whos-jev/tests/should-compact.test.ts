import test from "node:test";
import assert from "node:assert/strict";
import * as compact from "../src/examples/should-compact/index.ts";
import type { NoulAnswer, ScoreAnswer } from "../src/core/types.ts";

const noulA = (p: number): NoulAnswer => ({ type: "noul", noul: p });
const scoreA = (s: number): ScoreAnswer => ({ type: "score", score: s, legend: { "0": "none", "1": "some", "2": "most" }, probabilities: { "0": 0, "1": 0, "2": 1 }, confidence: 0.9 });
const answers = (o: Partial<Record<keyof compact.CompactAnswers, number>>): compact.CompactAnswers => ({
  switched_gears: noulA(o.switched_gears ?? 0.1),
  at_boundary: noulA(o.at_boundary ?? 0.1),
  needs_history: scoreA(o.needs_history ?? 2),
  mid_operation: noulA(o.mid_operation ?? 0.1),
});
const LINES = compact.DEFAULT_LINES;

test("should compact: nothing to compact is silent whatever Jev says", () => {
  const d = compact.decideTier(answers({ switched_gears: 0.95 }), { tokens: 12000, pct: 1.2 }, false, LINES);
  assert.equal(d.tier, "silent");
});

test("should compact: mid operation is silent even on a gear switch", () => {
  const d = compact.decideTier(answers({ switched_gears: 0.95, mid_operation: 0.8 }), { tokens: 12000, pct: 1.2 }, true, LINES);
  assert.equal(d.tier, "silent");
  assert.equal(d.reason, "mid operation");
});

test("should compact: the same work continuing is silent at any usage", () => {
  const d = compact.decideTier(answers({}), { tokens: 50000, pct: 5 }, true, LINES);
  assert.equal(d.tier, "silent");
});

test("should compact: a gear switch climbs the tiers with usage", () => {
  const a = answers({ switched_gears: 0.9 });
  assert.equal(compact.decideTier(a, { tokens: 3000, pct: 0.3 }, true, LINES).tier, "silent");
  assert.equal(compact.decideTier(a, { tokens: 7000, pct: 0.7 }, true, LINES).tier, "notice");
  assert.equal(compact.decideTier(a, { tokens: 11000, pct: 1.1 }, true, LINES).tier, "recommend");
  assert.equal(compact.decideTier(a, { tokens: 15000, pct: 1.5 }, true, LINES).tier, "request");
});

test("should compact: a finished boundary that needs no history also triggers", () => {
  const d = compact.decideTier(answers({ at_boundary: 0.8, needs_history: 0 }), { tokens: 11000, pct: 1.1 }, true, LINES);
  assert.equal(d.tier, "recommend");
});

test("should compact: silent injects nothing, the other tiers name the numbers", () => {
  assert.equal(compact.tierMessage({ tier: "silent", reason: "x" }, { tokens: 1, pct: 0 }), null);
  const m = compact.tierMessage({ tier: "request", reason: "The task changed." }, { tokens: 15200, pct: 1.5 });
  assert.match(m!, /^Please compact/);
  assert.match(m!, /15k tokens/);
  assert.match(m!, /compact_now/);
});

test("should compact: the verdict is typed and tells the agent what to do next", () => {
  const a = answers({ switched_gears: 0.9 });
  const usage = { tokens: 11000, pct: 1.1 };
  const v = compact.compactVerdict(compact.decideTier(a, usage, true, LINES), a, usage, LINES);
  assert.equal(v.should_compact, true);
  assert.equal(v.tier, "recommend");
  assert.equal(v.context_tokens, 11000);
  assert.match(v.next_step, /compact_now/);
  assert.equal(v.signals.switched_gears, 0.9);
});

test("should compact: the cut point question is a choice over real turns plus an exit", () => {
  const turns = [{ index: 0, request: "Explain the tokens" }, { index: 1, request: "Fix the failing test" }];
  const q = compact.cutPointQuestion(turns);
  assert.deepEqual(Object.keys(q.live_from.criteria), ["0", "1", "none"]);
});

test("should compact: a confident pick becomes instructions, a weak one falls back", () => {
  const turns = [{ index: 0, request: "Explain the tokens" }, { index: 1, request: "Fix the failing test" }];
  const strong = compact.cutPointInstructions(turns, { type: "choice", choice: "1", confidence: 0.9, probabilities: { "0": 0.05, "1": 0.9, none: 0.05 } });
  assert.equal(strong.liveFrom, 1);
  assert.match(strong.instructions, /Fix the failing test/);
  const weak = compact.cutPointInstructions(turns, { type: "choice", choice: "1", confidence: 0.4, probabilities: { "0": 0.3, "1": 0.4, none: 0.3 } });
  assert.equal(weak.liveFrom, null);
});

test("should compact: the mock picks the turn that reads like live work", async () => {
  const turns = [{ index: 0, request: "Explain the token lifetime" }, { index: 1, request: "Fix the failing proration test and run npm test" }];
  const { jev } = await import("../src/core/client.ts");
  const { answers } = await jev.systemOne({ turns, current_request: "run npm test again after the proration fix" }, compact.cutPointQuestion(turns));
  assert.ok(["0", "1", "none"].includes((answers.live_from as any).choice));
});
