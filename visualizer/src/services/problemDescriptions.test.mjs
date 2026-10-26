import test from "node:test";
import assert from "node:assert/strict";
import {
  createProblemDescriptionStore,
  getProblemDescriptionText,
} from "./problemDescriptions.js";

test("loads only the requested slug, shares requests, and caches results", async () => {
  const requested = [];
  const store = createProblemDescriptionStore(async (slug) => {
    requested.push(slug);
    return "Find two indices in an array that sum to target.";
  });
  assert.deepEqual(requested, []);
  const first = store.load("two-sum");
  assert.equal(store.load("two-sum"), first);
  await first;
  await store.load("two-sum");
  assert.deepEqual(requested, ["two-sum"]);
  assert.equal(
    store.getSnapshot("two-sum").description.content,
    "Find two indices in an array that sum to target.",
  );
});

test("late responses and notifications remain scoped to their problem", async () => {
  const resolve = {};
  const store = createProblemDescriptionStore(
    (slug) =>
      new Promise((done) => {
        resolve[slug] = done;
      }),
  );
  const slow = store.load("slow");
  const fast = store.load("fast");
  await Promise.resolve();
  resolve["fast"]("Fast task summary");
  await fast;
  let fastUpdates = 0;
  const unsubscribe = store.subscribe("fast", () => {
    fastUpdates++;
  });
  resolve["slow"]("Slow task summary");
  await slow;
  assert.equal(
    store.getSnapshot("fast").description.content,
    "Fast task summary",
  );
  assert.equal(fastUpdates, 0);
  unsubscribe();
});

test("missing slugs return missing status", async () => {
  let calls = 0;
  const store = createProblemDescriptionStore(async () => {
    calls++;
    return null;
  });
  assert.equal(
    (await store.load("non-existent-problem-slug-xyz")).status,
    "missing",
  );
  await store.load("non-existent-problem-slug-xyz");
  assert.equal(calls, 1);
});

test("failed requests can be retried and invalid slugs make no request", async () => {
  let calls = 0;
  const store = createProblemDescriptionStore(async () =>
    ++calls === 1 ? Promise.reject(new Error("failure")) : "recovered",
  );
  await store.load(null);
  await store.load("../escape");
  assert.equal(calls, 0);
  assert.equal((await store.load("two-sum")).status, "error");
  assert.equal((await store.load("two-sum")).status, "ready");
  assert.equal(calls, 2);
});

test("getProblemDescriptionText strips HTML tags safely", () => {
  assert.equal(
    getProblemDescriptionText({
      content: "<p>Test <strong>summary</strong></p>",
    }),
    "Test summary",
  );
  assert.equal(
    getProblemDescriptionText("Plain string summary"),
    "Plain string summary",
  );
  assert.equal(getProblemDescriptionText(null), null);
});
