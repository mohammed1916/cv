import test from "node:test";
import assert from "node:assert/strict";
import { STOCK_CODE, parsePricesInput, buildStock3Story } from "./algorithm.js";

test("STOCK_CODE matches python reference definition", () => {
  assert.equal(STOCK_CODE.length, 9);
  assert.match(STOCK_CODE[0], /def maxProfit\(prices\):/);
  assert.match(STOCK_CODE[1], /b1 = b2 = -inf/);
  assert.match(STOCK_CODE[2], /s1 = s2 = 0/);
  assert.match(STOCK_CODE[3], /for p in prices:/);
  assert.match(STOCK_CODE[4], /b1 = max\(b1, -p\)/);
  assert.match(STOCK_CODE[5], /s1 = max\(s1, b1 \+ p\)/);
  assert.match(STOCK_CODE[6], /b2 = max\(b2, s1 - p\)/);
  assert.match(STOCK_CODE[7], /s2 = max\(s2, b2 \+ p\)/);
  assert.match(STOCK_CODE[8], /return s2/);
});

test("parsePricesInput validates inputs strictly", () => {
  // Empty inputs
  assert.throws(() => parsePricesInput(""), /Input cannot be empty/);
  assert.throws(() => parsePricesInput("   "), /Input cannot be empty/);
  assert.throws(() => parsePricesInput(null), /Input must be provided/);
  assert.throws(() => parsePricesInput(undefined), /Input must be provided/);

  // Non-array structures
  assert.throws(() => parsePricesInput('{"a": 1}'), /Prices must be an array/);
  assert.throws(() => parsePricesInput({}), /Prices must be an array/);
  assert.throws(() => parsePricesInput(123), /Prices must be an array/);

  // Malformed JSON / format
  assert.throws(() => parsePricesInput("[1, 2,"), /Invalid JSON format/);
  assert.throws(() => parsePricesInput("abc"), /Invalid format for prices/);

  // Invalid data types and negative values
  assert.throws(() => parsePricesInput("[-1, 4, 5]"), /cannot be negative/);
  assert.throws(() => parsePricesInput("[1, 2.5, 3]"), /Invalid integer/);
  assert.throws(() => parsePricesInput('[1, "two", 3]'), /Invalid integer/);
  assert.throws(() => parsePricesInput([1, NaN, 3]), /Invalid integer/);

  // Exceeding length limit
  const longArray = new Array(51).fill(10);
  assert.throws(() => parsePricesInput(longArray), /exceeds limit/);

  // Valid inputs
  assert.deepEqual(parsePricesInput("[3, 3, 5, 0, 0, 3, 1, 4]"), [3, 3, 5, 0, 0, 3, 1, 4]);
  assert.deepEqual(parsePricesInput("3, 3, 5, 0, 0, 3, 1, 4"), [3, 3, 5, 0, 0, 3, 1, 4]);
  assert.deepEqual(parsePricesInput([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(parsePricesInput("[]"), []);
  assert.deepEqual(parsePricesInput([]), []);
});

test("example 1: [3,3,5,0,0,3,1,4] yields maxProfit = 6", () => {
  const story = buildStock3Story("[3, 3, 5, 0, 0, 3, 1, 4]");
  assert.equal(story.maxProfit, 6);
  assert.deepEqual(story.prices, [3, 3, 5, 0, 0, 3, 1, 4]);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 9);
  assert.equal(lastFrame.s2, 6);
});

test("example 2: [1,2,3,4,5] yields maxProfit = 4", () => {
  const story = buildStock3Story("[1, 2, 3, 4, 5]");
  assert.equal(story.maxProfit, 4);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.s2, 4);
});

test("example 3: [7,6,4,3,1] yields maxProfit = 0 (monotonically decreasing)", () => {
  const story = buildStock3Story("[7, 6, 4, 3, 1]");
  assert.equal(story.maxProfit, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.s2, 0);
  assert.equal(lastFrame.s1, 0);
});

test("handles empty prices array", () => {
  const story = buildStock3Story("[]");
  assert.equal(story.maxProfit, 0);
  assert.equal(story.prices.length, 0);
  assert.equal(story.frames.length, 2);
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[1].phase, "done");
});

test("handles single element array", () => {
  const story = buildStock3Story("[5]");
  assert.equal(story.maxProfit, 0);
  assert.equal(story.prices.length, 1);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.s2, 0);
  assert.equal(lastFrame.b1, -5);
  assert.equal(lastFrame.b2, -5);
});

test("handles two elements with profit and zero prices", () => {
  const story = buildStock3Story("[0, 5]");
  assert.equal(story.maxProfit, 5);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.s1, 5);
  assert.equal(lastFrame.s2, 5);
});

test("frames maintain immutable history snapshots and valid phase transitions", () => {
  const story = buildStock3Story("[2, 4, 1, 7]");
  assert.equal(story.maxProfit, 8); // (4-2) + (7-1) = 2 + 6 = 8

  // First frame is init
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[0].b1, -Infinity);
  assert.equal(story.frames[0].s1, 0);

  // Each day has iterate, buy1, sell1, buy2, sell2
  const phases = story.frames.map((f) => f.phase);
  assert.equal(phases[0], "init");
  assert.equal(phases[1], "iterate");
  assert.equal(phases[2], "buy1");
  assert.equal(phases[3], "sell1");
  assert.equal(phases[4], "buy2");
  assert.equal(phases[5], "sell2");
  assert.equal(phases[phases.length - 1], "done");

  // Verify history length increases per day
  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.history.length, 4);
  assert.equal(doneFrame.history[0].price, 2);
  assert.equal(doneFrame.history[3].price, 7);

  // Immutability: Mutating history in doneFrame does not affect earlier frames
  const originalInitHistoryLength = story.frames[0].history.length;
  doneFrame.history.push({ day: 99, price: 999 });
  assert.equal(story.frames[0].history.length, originalInitHistoryLength);
});
