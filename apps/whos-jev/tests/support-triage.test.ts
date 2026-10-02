import test from "node:test";
import assert from "node:assert/strict";
import { triageTicket } from "../src/examples/support-triage/index.ts";

test("support triage: a crashing bug routes to engineering", async () => {
  const t = await triageTicket("Export button crashes settings page in Safari. Steps: click Export, app freezes. Works in Chrome.");
  assert.equal(t.route, "engineering");
});

test("support triage: a duplicate charge routes to billing", async () => {
  const t = await triageTicket("You charged my card twice for order A-104. Please refund the duplicate charge.");
  assert.equal(t.route, "billing");
});

test("support triage: a feature request routes to product", async () => {
  const t = await triageTicket("Feature request: please add a dark mode to the dashboard, it does not exist yet.");
  assert.equal(t.route, "product");
});

test("support triage: both picks are always declared options (type safety)", async () => {
  const t = await triageTicket("Random text with no strong signal for any team.");
  assert.ok(["engineering", "billing", "product", "human"].includes(t.route));
  assert.ok(["low", "normal", "high"].includes(t.priority));
  assert.ok(t.confidence >= 0 && t.confidence <= 1);
});
