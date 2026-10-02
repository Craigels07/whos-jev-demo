import test from "node:test";
import assert from "node:assert/strict";
import * as ticket from "../src/examples/ticket-priority/index.ts";
import type { ScoreAnswer } from "../src/core/types.ts";

function scoreAnswer(score: number, levels: number, confidence = 0.9): ScoreAnswer {
  return {
    type: "score",
    score,
    legend: Object.fromEntries(Array.from({ length: levels }, (_, i) => [String(i), `level ${i}`])),
    probabilities: {},
    confidence,
  };
}

test("ticket priority: normalized() maps each scale to 0-1 regardless of level count", () => {
  assert.equal(ticket.normalized(scoreAnswer(2, 3)), 1);
  assert.equal(ticket.normalized(scoreAnswer(0, 3)), 0);
  assert.equal(ticket.normalized(scoreAnswer(2, 4)), 2 / 3);
});

test("ticket priority: combinePriority applies the visible weights exactly", () => {
  const { priority, parts } = ticket.combinePriority({
    severity: scoreAnswer(2, 3),      // 1.0
    frustration: scoreAnswer(1, 3),   // 0.5
    report_quality: scoreAnswer(2, 4) // 0.667
  });
  const expected = 0.6 * 1 + 0.3 * 0.5 + 0.1 * (2 / 3);
  assert.ok(Math.abs(priority - expected) < 0.01);
  assert.equal(parts.severity, 1);
});

test("ticket priority: ticketPriority runs end-to-end and lands in [0,1]", async () => {
  const { priority } = await ticket.ticketPriority(
    "Checkout is broken for all customers, no workaround, losing revenue, repro included."
  );
  assert.ok(priority >= 0 && priority <= 1);
});
