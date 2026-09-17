import test from "node:test";
import assert from "node:assert/strict";
import {
  STOCK_CODE,
  parsePricesInput,
  buildStock1Story,
} from "./algorithm.js";

test("STOCK_CODE matches the standard Python solution lines", () => {
  assert.equal(STOCK_CODE.length, 9);
  assert.ok(STOCK_CODE[0].includes("def maxProfit(prices):"));
  assert.ok(STOCK_CODE[1].includes("minPrice = float('inf')"));
  assert.ok(STOCK_CODE[2].includes("maxProfit = 0"));
  assert.ok(STOCK_CODE[3].includes("for price in prices:"));
  assert.ok(STOCK_CODE[4].includes("if price < minPrice:"));
  assert.ok(STOCK_CODE[5].includes("minPrice = price"));
  assert.ok(STOCK_CODE[6].includes("elif price - minPrice > maxProfit:"));
  assert.ok(STOCK_CODE[7].includes("maxProfit = price - minPrice"));
  assert.ok(STOCK_CODE[8].includes("return maxProfit"));
});

test("parsePricesInput validates inputs and formats strictly", () => {
  // Empty / null inputs
  assert.throws(() => parsePricesInput(""), /Input cannot be empty/);
  assert.throws(() => parsePricesInput("   "), /Input cannot be empty/);
  assert.throws(() => parsePricesInput(null), /Input cannot be empty/);
  assert.throws(() => parsePricesInput(undefined), /Input cannot be empty/);

  // Empty array
  assert.throws(
    () => parsePricesInput("[]"),
    /Prices array must contain at least 1 price/,
  );
  assert.throws(
    () => parsePricesInput([]),
    /Prices array must contain at least 1 price/,
  );

  // Invalid JSON format
  assert.throws(
    () => parsePricesInput("[1, 2,"),
    /Invalid JSON format/,
  );
  assert.throws(
    () => parsePricesInput('{"prices": [1, 2]}'),
    /Prices must be an array/,
  );

  // Comma-separated parsing
  const fromCsv = parsePricesInput("7, 1, 5, 3, 6, 4");
  assert.deepEqual(fromCsv, [7, 1, 5, 3, 6, 4]);

  assert.throws(
    () => parsePricesInput("7, , 5"),
    /Empty price value in comma-separated input/,
  );
  assert.throws(
    () => parsePricesInput("7, foo, 5"),
    /Invalid price number/,
  );

  // Non-integers and negatives
  assert.throws(
    () => parsePricesInput("[1, 2.5, 3]"),
    /must be an integer/,
  );
  assert.throws(
    () => parsePricesInput("[-2, 5, 10]"),
    /cannot be negative/,
  );

  // Array length exceeding 100
  const largeArray = new Array(101).fill(10);
  assert.throws(
    () => parsePricesInput(largeArray),
    /Prices array exceeds limit/,
  );
});

test("handles single element array", () => {
  const story = buildStock1Story("[10]");
  assert.deepEqual(story.prices, [10]);
  assert.equal(story.minPrice, 10);
  assert.equal(story.maxProfit, 0);
  assert.equal(story.bestBuyDay, -1);
  assert.equal(story.bestSellDay, -1);

  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.maxProfit, 0);
  assert.equal(doneFrame.activeLine, 9);
});

test("classic example correctly computes max profit and buy/sell days", () => {
  const story = buildStock1Story("[7, 1, 5, 3, 6, 4]");
  assert.equal(story.maxProfit, 5);
  assert.equal(story.bestBuyDay, 1); // price 1
  assert.equal(story.bestSellDay, 4); // price 6
  assert.equal(story.minPrice, 1);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.maxProfit, 5);
  assert.equal(lastFrame.bestBuyDay, 1);
  assert.equal(lastFrame.bestSellDay, 4);
});

test("strictly increasing prices buy at day 0 and sell at last day", () => {
  const story = buildStock1Story("[1, 2, 3, 4, 5]");
  assert.equal(story.maxProfit, 4);
  assert.equal(story.bestBuyDay, 0);
  assert.equal(story.bestSellDay, 4);
  assert.equal(story.minPrice, 1);
});

test("strictly decreasing prices yield 0 profit and no trade", () => {
  const story = buildStock1Story("[7, 6, 4, 3, 1]");
  assert.equal(story.maxProfit, 0);
  assert.equal(story.bestBuyDay, -1);
  assert.equal(story.bestSellDay, -1);
  assert.equal(story.minPrice, 1);

  // In decreasing prices, every day triggers `if price < minPrice: minPrice = price`
  const updateMinFrames = story.frames.filter(
    (f) => f.phase === "update" && f.activeLine === 6,
  );
  assert.equal(updateMinFrames.length, 5);
  // Profit update line 8 should never be hit
  const updateProfitFrames = story.frames.filter(
    (f) => f.phase === "update" && f.activeLine === 8,
  );
  assert.equal(updateProfitFrames.length, 0);
});

test("handles ties in minimum prices and profits accurately", () => {
  // Flat prices
  const flatStory = buildStock1Story("[3, 3, 3, 3]");
  assert.equal(flatStory.maxProfit, 0);
  assert.equal(flatStory.minPrice, 3);
  assert.equal(flatStory.bestBuyDay, -1);

  // Equal profits at different times preserves first discovered best trade
  // Day 0: 2 (min=2)
  // Day 1: 4 (profit=2, maxProfit=2, buy=0, sell=1)
  // Day 2: 1 (min=1)
  // Day 3: 3 (profit=2, but 2 > 2 is false -> buy=0, sell=1 retained)
  const tieProfitStory = buildStock1Story([2, 4, 1, 3]);
  assert.equal(tieProfitStory.maxProfit, 2);
  assert.equal(tieProfitStory.bestBuyDay, 0);
  assert.equal(tieProfitStory.bestSellDay, 1);

  // Duplicate minimum price retains earlier index because price < minPrice is strictly less
  // Day 0: 5 (min=5, day=0)
  // Day 1: 2 (min=2, day=1)
  // Day 2: 2 (2 < 2 is False, min remains day=1)
  // Day 3: 6 (profit=4, buy=1, sell=3)
  const duplicateMinStory = buildStock1Story([5, 2, 2, 6]);
  assert.equal(duplicateMinStory.maxProfit, 4);
  assert.equal(duplicateMinStory.bestBuyDay, 1);
  assert.equal(duplicateMinStory.bestSellDay, 3);
});

test("handles zero prices and two dips example", () => {
  // Zero price is valid
  const zeroStory = buildStock1Story("[0, 5, 0, 7]");
  assert.equal(zeroStory.maxProfit, 7);
  assert.equal(zeroStory.bestBuyDay, 0);
  assert.equal(zeroStory.bestSellDay, 3);

  // Two dips: [3, 1, 4, 1, 5, 9, 2, 6] -> Buy at 1 (day 1), sell at 9 (day 5) -> profit 8
  const dipsStory = buildStock1Story([3, 1, 4, 1, 5, 9, 2, 6]);
  assert.equal(dipsStory.maxProfit, 8);
  assert.equal(dipsStory.bestBuyDay, 1);
  assert.equal(dipsStory.bestSellDay, 5);
});

test("trace snapshots are immutable and frozen across execution steps", () => {
  const story = buildStock1Story([7, 1, 5, 3, 6, 4]);
  assert.ok(Object.isFrozen(story.prices));

  // Verify all frames are frozen
  for (const frame of story.frames) {
    assert.ok(Object.isFrozen(frame));
  }

  // Frame 0: minPrice is Infinity
  const frame0 = story.frames[0];
  assert.equal(frame0.minPrice, Infinity);
  assert.equal(frame0.maxProfit, 0);

  // Frame at line 6 for price 1
  const updateMinFrame = story.frames.find(
    (f) => f.activeLine === 6 && f.minPrice === 1,
  );
  assert.ok(updateMinFrame);
  assert.equal(updateMinFrame.minPrice, 1);
  assert.equal(updateMinFrame.minDay, 1);

  // Frame 0 still has Infinity (was not overwritten)
  assert.equal(frame0.minPrice, Infinity);

  // Attempting to mutate a frozen frame throws TypeError
  assert.throws(() => {
    frame0.minPrice = 123;
  }, TypeError);
});
