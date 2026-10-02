import test from "node:test";
import assert from "node:assert/strict";
import * as routing from "../src/examples/routing/index.ts";
test("routing, model router: fast vs powerful with an effort read", async () => {
  const simple = await routing.routeModel("Look up the refund policy in the docs and summarize it in one line");
  assert.equal(simple.model, "fast");
  const hard = await routing.routeModel("Refactor the auth middleware architecture for rotating keys across services; high-stakes decisions");
  assert.equal(hard.model, "powerful");
});
