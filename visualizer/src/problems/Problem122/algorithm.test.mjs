import test from "node:test";
import assert from "node:assert/strict";
import {
  STOCK_CODE,
  parsePricesInput,
  buildStock2Story,
} from "./algorithm.js";

test("STOCK_CODE exports exact expected Python implementation", () => {
  assert.ok(Array.isArray(STOCK_CODE));
  assert.equal(STOCK_CODE.length, 6);
  assert.equal(STOCK_CODE[0], "def maxProfit(prices):");
  assert.equal(STOCK_CODE[1], "    profit = 0");
  assert.equal(STOCK_CODE[2], "    for i in range(1, len(prices)):");
  assert.equal(STOCK_CODE[3], "        if prices[i] > prices[i-1]:");
  assert.equal(STOCK_CODE[4], "            profit += prices[i] - prices[i-1]");
  assert.equal(STOCK_CODE[5], "    return profit");
});

test("parsePricesInput validates inputs strictly and throws helpful errors", () => {
  assert.throws(() => parsePricesInput(null), /Input is required/);
  assert.throws(() => parsePricesInput(undefined), /Input is required/);
  assert.throws(() => parsePricesInput(""), /Input cannot be empty/);
  assert.throws(() => parsePricesInput("   "), /Input cannot be empty/);
  assert.throws(
    () => parsePricesInput('{"prices": [1, 2]}'),
    /Prices input must be an array of integers/,
  );
  assert.throws(() => parsePricesInput(123), /Prices input must be an array/);
  assert.throws(
    () => parsePricesInput('[1, "two", 3]'),
    /Invalid price at index 1/,
  );
  assert.throws(
    () => parsePricesInput("[1, 'two', 3]"),
    /Invalid JSON array format/,
  );
  assert.throws(
    () => parsePricesInput("[1, 2.5, 3]"),
    /Invalid price at index 1: "2.5"/,
  );
  assert.throws(
    () => parsePricesInput("[-1, 2, 3]"),
    /Prices cannot be negative/,
  );
  assert.throws(
    () => parsePricesInput("[0, 5, -10]"),
    /Prices cannot be negative/,
  );
  assert.throws(
    () => parsePricesInput("1, abc, 3"),
    /Invalid price value: "abc"/,
  );

  // Valid inputs in various formats
  assert.deepEqual(parsePricesInput("[7, 1, 5, 3, 6, 4]"), [7, 1, 5, 3, 6, 4]);
  assert.deepEqual(parsePricesInput("7, 1, 5, 3, 6, 4"), [7, 1, 5, 3, 6, 4]);
  assert.deepEqual(parsePricesInput([7, 1, 5, 3, 6, 4]), [7, 1, 5, 3, 6, 4]);
  assert.deepEqual(parsePricesInput("[]"), []);
  assert.deepEqual(parsePricesInput("[0]"), [0]);
  assert.deepEqual(parsePricesInput("[0, 0, 0]"), [0, 0, 0]);
});

test("standard example 1: [7, 1, 5, 3, 6, 4] yields profit 7 with 2 transactions", () => {
  const story = buildStock2Story("[7, 1, 5, 3, 6, 4]");
  assert.equal(story.totalProfit, 7);
  assert.deepEqual(story.transactions, [
    { buyDay: 1, sellDay: 2, profit: 4 },
    { buyDay: 3, sellDay: 4, profit: 3 },
  ]);

  // First frame is init (line 2)
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[0].activeLine, 2);
  assert.equal(story.frames[0].profit, 0);

  // Last frame is done (line 6)
  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 6);
  assert.equal(lastFrame.profit, 7);
  assert.equal(lastFrame.transactions.length, 2);

  // Verify compare frames and update frames
  const updateFrames = story.frames.filter((f) => f.phase === "update");
  assert.equal(updateFrames.length, 2);
  assert.equal(updateFrames[0].diff, 4);
  assert.equal(updateFrames[0].profit, 4);
  assert.equal(updateFrames[1].diff, 3);
  assert.equal(updateFrames[1].profit, 7);
});

test("standard example 2: [1, 2, 3, 4, 5] yields profit 4 with 4 transactions", () => {
  const story = buildStock2Story([1, 2, 3, 4, 5]);
  assert.equal(story.totalProfit, 4);
  assert.deepEqual(story.transactions, [
    { buyDay: 0, sellDay: 1, profit: 1 },
    { buyDay: 1, sellDay: 2, profit: 1 },
    { buyDay: 2, sellDay: 3, profit: 1 },
    { buyDay: 3, sellDay: 4, profit: 1 },
  ]);

  const updateFrames = story.frames.filter((f) => f.phase === "update");
  assert.equal(updateFrames.length, 4);
  assert.equal(story.frames[story.frames.length - 1].profit, 4);
});

test("standard example 3: [7, 6, 4, 3, 1] strictly decreasing yields profit 0 and 0 transactions", () => {
  const story = buildStock2Story([7, 6, 4, 3, 1]);
  assert.equal(story.totalProfit, 0);
  assert.deepEqual(story.transactions, []);

  // No update frames should exist
  const updateFrames = story.frames.filter((f) => f.phase === "update");
  assert.equal(updateFrames.length, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.profit, 0);
});

test("handles single element array", () => {
  const story = buildStock2Story("[5]");
  assert.equal(story.totalProfit, 0);
  assert.deepEqual(story.transactions, []);
  assert.equal(story.frames.length, 2);
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[1].phase, "done");
  assert.equal(story.frames[1].activeLine, 6);
});

test("handles empty array", () => {
  const story = buildStock2Story("[]");
  assert.equal(story.totalProfit, 0);
  assert.deepEqual(story.transactions, []);
  assert.equal(story.frames.length, 1);
  assert.equal(story.frames[0].phase, "done");
  assert.equal(story.frames[0].activeLine, 6);
});

test("handles all equal prices", () => {
  const story = buildStock2Story("[3, 3, 3, 3]");
  assert.equal(story.totalProfit, 0);
  assert.deepEqual(story.transactions, []);

  const updateFrames = story.frames.filter((f) => f.phase === "update");
  assert.equal(updateFrames.length, 0);

  const compareFrames = story.frames.filter((f) => f.phase === "compare");
  assert.equal(compareFrames.length, 3);
  for (const f of compareFrames) {
    assert.equal(f.diff, 0);
    assert.equal(f.isUpward, false);
  }
});

test("frames maintain immutability and do not leak future transaction mutations", () => {
  const story = buildStock2Story([1, 5, 2, 8]);
  assert.equal(story.totalProfit, 10);

  // At frame 0 (init), transactions should be 0
  assert.equal(story.frames[0].transactions.length, 0);

  // Find first update frame
  const firstUpdateIdx = story.frames.findIndex((f) => f.phase === "update");
  assert.ok(firstUpdateIdx > 0);
  assert.equal(story.frames[firstUpdateIdx].transactions.length, 1);
  assert.deepEqual(story.frames[firstUpdateIdx].transactions[0], {
    buyDay: 0,
    sellDay: 1,
    profit: 4,
  });

  // Verify earlier frame transactions remained empty
  assert.equal(story.frames[0].transactions.length, 0);
  assert.equal(story.frames[1].transactions.length, 0);

  // Check last frame has all transactions
  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.transactions.length, 2);
  assert.equal(lastFrame.profit, 10);
});
