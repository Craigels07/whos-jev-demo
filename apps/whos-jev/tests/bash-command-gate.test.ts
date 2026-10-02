import test from "node:test";
import assert from "node:assert/strict";
import * as gate from "../src/examples/bash-command-gate/index.ts";
import type { ChoiceAnswer, NoulAnswer } from "../src/core/types.ts";

function choiceAnswer(choice: string, confidence: number): ChoiceAnswer {
  return { type: "choice", choice, probabilities: { [choice]: confidence }, confidence };
}
function noulAnswer(noul: number): NoulAnswer {
  return { type: "noul", noul };
}

test("bash command gate: an ambiguous rm -rf reproduces the shadow-test escalation", () => {
  // The field result: irreversible at ~0.56 probability, confidence ~0.33 -> ask a human.
  const d = gate.decideCommandSafety(
    choiceAnswer("irreversible", 0.33),
    noulAnswer(0.3),
    noulAnswer(0.6)
  );
  assert.equal(d.requiresHuman, true);
  assert.equal(d.run, false);
});

test("bash command gate: a read-only command with decent confidence runs unattended", () => {
  const d = gate.decideCommandSafety(
    choiceAnswer("read_only", 0.8),
    noulAnswer(0.1),
    noulAnswer(0.05)
  );
  assert.equal(d.run, true);
  assert.equal(d.requiresHuman, false);
});

test("bash command gate: end-to-end: rm -rf node_modules && npm install is irreversible", async () => {
  const d = await gate.gateShellCommand("rm -rf node_modules && npm install", "/repo");
  assert.equal(d.classification, "irreversible");
  assert.equal(d.run, false);
});

test("bash command gate: a confident change with no red flags asks to confirm", () => {
  const d = gate.decideCommandSafety(
    choiceAnswer("reversible", 0.95),
    noulAnswer(0.1),
    noulAnswer(0.1)
  );
  assert.equal(d.action, "confirm");
  assert.equal(d.run, false);
  assert.equal(d.requiresHuman, false);
});

test("bash command gate: action names the outcome run and requiresHuman describe", () => {
  assert.equal(gate.decideCommandSafety(choiceAnswer("read_only", 0.8), noulAnswer(0.1), noulAnswer(0.05)).action, "run");
  assert.equal(gate.decideCommandSafety(choiceAnswer("irreversible", 0.33), noulAnswer(0.3), noulAnswer(0.6)).action, "human");
});

test("bash command gate: the reason names the rule that decided", () => {
  assert.equal(gate.decideCommandSafety(choiceAnswer("irreversible", 0.96), noulAnswer(0.1), noulAnswer(0.9)).reason, "destructive");
  assert.equal(gate.decideCommandSafety(choiceAnswer("read_only", 0.33), noulAnswer(0.1), noulAnswer(0.1)).reason, "unsure, confidence 0.33");
  assert.equal(gate.decideCommandSafety(choiceAnswer("read_only", 0.9), noulAnswer(0.1), noulAnswer(0.1)).reason, "read only");
});
