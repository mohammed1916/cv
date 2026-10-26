import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseNumsInput,
  computeBitWidth,
  toBinaryString,
  computeBitOps,
  buildSingleNumberStory,
} from "./algorithm.js";

test("CODE export matches Python reference implementation exactly", () => {
  assert.equal(Array.isArray(CODE), true);
  assert.equal(CODE.length, 5);
  assert.equal(CODE[0], "def singleNumber(nums):");
  assert.equal(CODE[1], "    result = 0");
  assert.equal(CODE[2], "    for num in nums:");
  assert.equal(CODE[3], "        result ^= num");
  assert.equal(CODE[4], "    return result");
});

test("parseNumsInput handles valid arrays, JSON strings, and delimited strings", () => {
  // Direct array of numbers
  assert.deepEqual(parseNumsInput([2, 2, 1]), [2, 2, 1]);
  assert.deepEqual(parseNumsInput([4, 1, 2, 1, 2]), [4, 1, 2, 1, 2]);
  assert.deepEqual(parseNumsInput([1]), [1]);

  // JSON string format
  assert.deepEqual(parseNumsInput("[2, 2, 1]"), [2, 2, 1]);
  assert.deepEqual(parseNumsInput("[4, 1, 2, 1, 2]"), [4, 1, 2, 1, 2]);
  assert.deepEqual(parseNumsInput("[1]"), [1]);
  assert.deepEqual(parseNumsInput("[-2, 1, -2]"), [-2, 1, -2]);

  // Comma and space separated strings
  assert.deepEqual(parseNumsInput("2, 2, 1"), [2, 2, 1]);
  assert.deepEqual(parseNumsInput("4  1  2  1  2"), [4, 1, 2, 1, 2]);
  assert.deepEqual(parseNumsInput("  -5, -5, 3  "), [-5, -5, 3]);

  // Numbers with 0 and negative integers
  assert.deepEqual(parseNumsInput([0, 1, 0]), [0, 1, 0]);
  assert.deepEqual(parseNumsInput([-10, -10, 42]), [-10, -10, 42]);
});

test("parseNumsInput rejects invalid inputs with descriptive errors", () => {
  // Empty / null / undefined
  assert.throws(() => parseNumsInput(null), /Input cannot be empty/);
  assert.throws(() => parseNumsInput(undefined), /Input cannot be empty/);
  assert.throws(() => parseNumsInput(""), /Input cannot be empty/);
  assert.throws(() => parseNumsInput("   "), /Input cannot be empty/);

  // Empty array
  assert.throws(() => parseNumsInput([]), /Array must contain at least one integer/);
  assert.throws(() => parseNumsInput("[]"), /Array must contain at least one integer/);

  // Non-array JSON
  assert.throws(() => parseNumsInput("{}"), /Input must be an array of integers/);
  assert.throws(() => parseNumsInput(123), /Input must be an array of integers/);
  assert.throws(() => parseNumsInput(true), /Input must be an array of integers/);

  // Non-integer elements
  assert.throws(() => parseNumsInput("[1, 2.5, 1]"), /must be an integer/);
  assert.throws(() => parseNumsInput([1, "hello", 1]), /must be an integer/);
  assert.throws(() => parseNumsInput([1, true, 1]), /must be an integer/);
  assert.throws(() => parseNumsInput([1, null, 1]), /must be an integer/);
  assert.throws(() => parseNumsInput("1, abc, 2"), /all items must be integers/);

  // Exceeding maximum length
  const huge = Array.from({ length: 101 }, () => 1);
  assert.throws(() => parseNumsInput(huge), /Array exceeds maximum supported length/);
});

test("computeBitWidth and toBinaryString handle positive and negative integers", () => {
  assert.equal(computeBitWidth([2, 2, 1]), 4);
  assert.equal(computeBitWidth([4, 1, 2, 1, 2]), 4);
  assert.equal(toBinaryString(4, 4), "0100");
  assert.equal(toBinaryString(1, 4), "0001");
  assert.equal(toBinaryString(0, 4), "0000");

  // Negative values in two's complement
  const signedWidth = computeBitWidth([-2, 1, -2]);
  assert.equal(signedWidth, 4);
  assert.equal(toBinaryString(-2, 4), "1110");
  assert.equal(toBinaryString(1, 4), "0001");

  // 8-bit negative numbers
  assert.equal(computeBitWidth([-100, 50, -100]), 8);
  assert.equal(toBinaryString(-1, 8), "11111111");
  assert.equal(toBinaryString(0, 8), "00000000");
});

test("computeBitOps accurately labels bitwise transitions", () => {
  // 2 ^ 2 = 0 in 4 bits: 0010 ^ 0010 = 0000 -> bit 1 should be 'cancel'
  const opsCancel = computeBitOps(2, 2, 4);
  const bit1 = opsCancel.find((o) => o.bitIndex === 1);
  assert.equal(bit1.prevBit, 1);
  assert.equal(bit1.numBit, 1);
  assert.equal(bit1.resultBit, 0);
  assert.equal(bit1.action, "cancel");

  // 0 ^ 4 = 4 in 4 bits: 0000 ^ 0100 = 0100 -> bit 2 should be 'set'
  const opsSet = computeBitOps(0, 4, 4);
  const bit2 = opsSet.find((o) => o.bitIndex === 2);
  assert.equal(bit2.prevBit, 0);
  assert.equal(bit2.numBit, 1);
  assert.equal(bit2.resultBit, 1);
  assert.equal(bit2.action, "set");

  // 4 ^ 1 = 5 in 4 bits: 0100 ^ 0001 = 0101 -> bit 2 should be 'keep', bit 0 should be 'set'
  const opsKeep = computeBitOps(4, 1, 4);
  const bit2Keep = opsKeep.find((o) => o.bitIndex === 2);
  assert.equal(bit2Keep.prevBit, 1);
  assert.equal(bit2Keep.numBit, 0);
  assert.equal(bit2Keep.resultBit, 1);
  assert.equal(bit2Keep.action, "keep");
});

test("buildSingleNumberStory correctly solves [2, 2, 1] returning 1", () => {
  const story = buildSingleNumberStory([2, 2, 1]);
  assert.deepEqual(story.nums, [2, 2, 1]);
  assert.equal(story.singleVal, 1);
  assert.ok(story.frames.length >= 6);

  // Init frame
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[0].activeLine, 2);
  assert.equal(story.frames[0].result, 0);

  // Final frame
  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 5);
  assert.equal(lastFrame.result, 1);
  assert.equal(lastFrame.singleVal, 1);

  // Check pair detection on index 1 (second '2')
  const pairCancelFrame = story.frames.find((f) => f.activePair !== null);
  assert.ok(pairCancelFrame);
  assert.equal(pairCancelFrame.activePair.val, 2);
  assert.equal(pairCancelFrame.activePair.firstIndex, 0);
  assert.equal(pairCancelFrame.activePair.secondIndex, 1);
  assert.equal(pairCancelFrame.result, 0); // 2 ^ 2 = 0
});

test("buildSingleNumberStory correctly solves [4, 1, 2, 1, 2] returning 4", () => {
  const story = buildSingleNumberStory([4, 1, 2, 1, 2]);
  assert.deepEqual(story.nums, [4, 1, 2, 1, 2]);
  assert.equal(story.singleVal, 4);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.result, 4);

  // Cancelled indices should ultimately contain all pairs (indices 1, 2, 3, 4)
  assert.equal(lastFrame.cancelledIndices.length, 4);
  assert.ok(lastFrame.cancelledIndices.includes(1));
  assert.ok(lastFrame.cancelledIndices.includes(2));
  assert.ok(lastFrame.cancelledIndices.includes(3));
  assert.ok(lastFrame.cancelledIndices.includes(4));
  assert.ok(!lastFrame.cancelledIndices.includes(0)); // 4 at index 0 is not cancelled!

  // Bit parity invariant
  for (const col of story.bitColumns) {
    assert.equal(col.parity, col.resultBit);
  }
});

test("buildSingleNumberStory correctly solves single element array [1]", () => {
  const story = buildSingleNumberStory([1]);
  assert.deepEqual(story.nums, [1]);
  assert.equal(story.singleVal, 1);
  assert.equal(story.frames.length, 4); // init, loop, xor, done

  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[1].phase, "loop");
  assert.equal(story.frames[2].phase, "xor");
  assert.equal(story.frames[2].result, 1);
  assert.equal(story.frames[3].phase, "done");
  assert.equal(story.frames[3].result, 1);
});

test("buildSingleNumberStory handles negative numbers correctly", () => {
  // [-2, 1, -2] -> 1
  const story1 = buildSingleNumberStory([-2, 1, -2]);
  assert.equal(story1.singleVal, 1);
  const last1 = story1.frames[story1.frames.length - 1];
  assert.equal(last1.result, 1);
  assert.ok(last1.cancelledIndices.includes(0));
  assert.ok(last1.cancelledIndices.includes(2));

  // [-1, -1, -5] -> -5
  const story2 = buildSingleNumberStory([-1, -1, -5]);
  assert.equal(story2.singleVal, -5);
  const last2 = story2.frames[story2.frames.length - 1];
  assert.equal(last2.result, -5);

  // [3, -7, 3] -> -7
  const story3 = buildSingleNumberStory([3, -7, 3]);
  assert.equal(story3.singleVal, -7);

  // Check column parity invariants for signed inputs
  for (const col of story2.bitColumns) {
    assert.equal(col.parity, col.resultBit);
  }
});

test("Story frames are immutable across playback steps", () => {
  const story = buildSingleNumberStory([2, 2, 1]);
  const frame0Cancelled = story.frames[0].cancelledIndices;
  const frame2Cancelled = story.frames[4].cancelledIndices; // After 2nd element cancelled

  assert.equal(frame0Cancelled.length, 0);
  assert.equal(frame2Cancelled.length, 2);
  assert.notEqual(frame0Cancelled, frame2Cancelled);
});
