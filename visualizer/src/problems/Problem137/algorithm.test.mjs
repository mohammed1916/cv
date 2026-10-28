import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseNumsInput,
  determineBitWidth,
  toBinaryString,
  buildSingleNumber2Story,
} from "./algorithm.js";

test("CODE matches the standard Single Number II Python solution lines", () => {
  assert.equal(CODE.length, 6);
  assert.equal(CODE[0], "def singleNumber(nums):");
  assert.equal(CODE[1], "    ones, twos = 0, 0");
  assert.equal(CODE[2], "    for num in nums:");
  assert.equal(CODE[3], "        ones = (ones ^ num) & ~twos");
  assert.equal(CODE[4], "        twos = (twos ^ num) & ~ones");
  assert.equal(CODE[5], "    return ones");
});

test("parseNumsInput accepts valid arrays, JSON strings, and CSV strings", () => {
  // Array inputs
  assert.deepEqual(parseNumsInput([2, 2, 3, 2]), [2, 2, 3, 2]);
  assert.deepEqual(
    parseNumsInput([0, 1, 0, 1, 0, 1, 99]),
    [0, 1, 0, 1, 0, 1, 99]
  );
  assert.deepEqual(parseNumsInput([42]), [42]);
  assert.deepEqual(
    parseNumsInput([-2, -2, 1, 1, -3, 1, -2]),
    [-2, -2, 1, 1, -3, 1, -2]
  );
  assert.deepEqual(parseNumsInput([-4, -1, -4, -4]), [-4, -1, -4, -4]);

  // JSON strings
  assert.deepEqual(parseNumsInput("[2, 2, 3, 2]"), [2, 2, 3, 2]);
  assert.deepEqual(
    parseNumsInput("[0, 1, 0, 1, 0, 1, 99]"),
    [0, 1, 0, 1, 0, 1, 99]
  );
  assert.deepEqual(parseNumsInput("[42]"), [42]);
  assert.deepEqual(
    parseNumsInput("[-2, -2, 1, 1, -3, 1, -2]"),
    [-2, -2, 1, 1, -3, 1, -2]
  );

  // CSV strings
  assert.deepEqual(parseNumsInput("2, 2, 3, 2"), [2, 2, 3, 2]);
  assert.deepEqual(
    parseNumsInput("0, 1, 0, 1, 0, 1, 99"),
    [0, 1, 0, 1, 0, 1, 99]
  );
  assert.deepEqual(parseNumsInput("42"), [42]);
  assert.deepEqual(
    parseNumsInput("-2, -2, 1, 1, -3, 1, -2"),
    [-2, -2, 1, 1, -3, 1, -2]
  );
});

test("parseNumsInput rejects invalid inputs strictly", () => {
  // Empty / nullish
  assert.throws(() => parseNumsInput(null), /cannot be empty/i);
  assert.throws(() => parseNumsInput(undefined), /cannot be empty/i);
  assert.throws(() => parseNumsInput(""), /cannot be empty/i);
  assert.throws(() => parseNumsInput("   "), /cannot be empty/i);
  assert.throws(() => parseNumsInput([]), /cannot be empty/i);
  assert.throws(() => parseNumsInput("[]"), /cannot be empty/i);

  // Invalid JSON format
  assert.throws(() => parseNumsInput("[2, 2, 3,"), /invalid json/i);
  assert.throws(() => parseNumsInput("2, 2, 3]"), /invalid json array format/i);
  assert.throws(() => parseNumsInput("[2, 2, 3"), /invalid json array format/i);
  assert.throws(() => parseNumsInput('{"nums": [2, 2, 3, 2]}'), /must be an array/i);
  assert.throws(() => parseNumsInput(12345), /must be an array of integers or a string/i);

  // Non-integers / NaN / Infinity
  assert.throws(() => parseNumsInput([2, 2, 2.5, 2]), /not an integer/i);
  assert.throws(() => parseNumsInput([2, 2, NaN, 2]), /not an integer/i);
  assert.throws(() => parseNumsInput([2, 2, Infinity, 2]), /not an integer/i);
  assert.throws(() => parseNumsInput([2, 2, "three", 2]), /not an integer/i);
  assert.throws(() => parseNumsInput("2, 2, 2.5, 2"), /not an integer/i);
  assert.throws(() => parseNumsInput("2, 2, , 2"), /empty number token/i);

  // Out of 32-bit range
  assert.throws(() => parseNumsInput([3000000000, 3000000000, 3000000000, 1]), /out of 32-bit/i);
  assert.throws(() => parseNumsInput([-3000000000, -3000000000, -3000000000, 1]), /out of 32-bit/i);

  // Constraint violation: elements must appear 3 times except 1 appearing once
  assert.throws(() => parseNumsInput([2, 2, 2]), /every element must appear exactly 3 times/i);
  assert.throws(() => parseNumsInput([1, 2, 3]), /every element must appear exactly 3 times/i);
  assert.throws(() => parseNumsInput([2, 2]), /every element must appear exactly 3 times/i);
  assert.throws(() => parseNumsInput([2, 2, 2, 2]), /every element must appear exactly 3 times/i);
  assert.throws(() => parseNumsInput([1, 1, 2, 2]), /every element must appear exactly 3 times/i);
  assert.throws(() => parseNumsInput([2, 2, 2, 3, 3, 3]), /every element must appear exactly 3 times/i);
  assert.throws(() => parseNumsInput([1, 1, 1, 2, 2, 2, 3, 3]), /every element must appear exactly 3 times/i);

  // Exceeds max length limit
  const largeArray = [];
  for (let i = 0; i < 34; i++) {
    largeArray.push(i, i, i);
  }
  largeArray.push(999); // 34 * 3 + 1 = 103 elements
  assert.throws(() => parseNumsInput(largeArray), /exceeds maximum length/i);
});

test("determineBitWidth and toBinaryString handle ranges correctly", () => {
  assert.equal(determineBitWidth([2, 2, 3, 2]), 4);
  assert.equal(determineBitWidth([0, 1, 0, 1, 0, 1, 99]), 8);
  assert.equal(determineBitWidth([-2, -2, 1, 1, -3, 1, -2]), 8);
  assert.equal(determineBitWidth([-4, -1, -4, -4]), 8);

  assert.equal(toBinaryString(2, 4), "0010");
  assert.equal(toBinaryString(3, 4), "0011");
  assert.equal(toBinaryString(99, 8), "01100011");
  assert.equal(toBinaryString(-2, 8), "11111110");
  assert.equal(toBinaryString(-1, 8), "11111111");
});

test("buildSingleNumber2Story solves [2, 2, 3, 2] -> singleVal = 3", () => {
  const story = buildSingleNumber2Story([2, 2, 3, 2]);
  assert.equal(story.singleVal, 3);
  assert.deepEqual(story.nums, [2, 2, 3, 2]);

  const { frames } = story;
  assert.ok(frames.length > 0);

  // Initial frame
  assert.equal(frames[0].activeLine, 2);
  assert.equal(frames[0].phase, "init");
  assert.equal(frames[0].ones, 0);
  assert.equal(frames[0].twos, 0);
  assert.equal(frames[0].currentIndex, -1);

  // Final frame
  const last = frames[frames.length - 1];
  assert.equal(last.activeLine, 6);
  assert.equal(last.phase, "done");
  assert.equal(last.ones, 3);
  assert.equal(last.twos, 0);
  assert.equal(last.singleVal, 3);

  // Invariant: ones & twos == 0 at all times
  for (const f of frames) {
    assert.equal(f.ones & f.twos, 0, `ones & twos must be 0, got ones=${f.ones}, twos=${f.twos}`);
    assert.ok([2, 3, 4, 5, 6].includes(f.activeLine));
    assert.ok(typeof f.message === "string" && f.message.length > 0);
    assert.ok(typeof f.explanation === "string" && f.explanation.length > 0);
    assert.ok(Array.isArray(f.relatedLines));
  }
});

test("buildSingleNumber2Story solves [0, 1, 0, 1, 0, 1, 99] -> singleVal = 99", () => {
  const story = buildSingleNumber2Story([0, 1, 0, 1, 0, 1, 99]);
  assert.equal(story.singleVal, 99);
  assert.deepEqual(story.nums, [0, 1, 0, 1, 0, 1, 99]);

  const last = story.frames[story.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.ones, 99);
  assert.equal(last.twos, 0);
  assert.equal(last.singleVal, 99);
});

test("buildSingleNumber2Story solves single element [42] -> singleVal = 42", () => {
  const story = buildSingleNumber2Story([42]);
  assert.equal(story.singleVal, 42);
  assert.deepEqual(story.nums, [42]);

  const last = story.frames[story.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.ones, 42);
  assert.equal(last.twos, 0);
});

test("buildSingleNumber2Story handles negative numbers correctly", () => {
  const story = buildSingleNumber2Story([-2, -2, 1, 1, -3, 1, -2]);
  assert.equal(story.singleVal, -3);

  const last = story.frames[story.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.ones, -3);
  assert.equal(last.twos, 0);

  const story2 = buildSingleNumber2Story([-4, -1, -4, -4]);
  assert.equal(story2.singleVal, -1);
  const last2 = story2.frames[story2.frames.length - 1];
  assert.equal(last2.phase, "done");
  assert.equal(last2.ones, -1);
  assert.equal(last2.twos, 0);
});

test("buildSingleNumber2Story frames are immutable snapshots", () => {
  const story = buildSingleNumber2Story([2, 2, 3, 2]);
  const f0 = story.frames[0];
  const f1 = story.frames[1];

  assert.notEqual(f0.processedIndices, f1.processedIndices);
  assert.notEqual(f0.bitStates, f1.bitStates);

  // Mutating frame 0 shouldn't change frame 1
  f0.processedIndices.push(999);
  assert.ok(!f1.processedIndices.includes(999));
});

// ─── Statement contract tests (parseInput / buildTrace / python) ───
import { parseInput, buildTrace, code, python } from './algorithm.js'

test('statement examples', () => {
  assert.equal(buildTrace(parseInput('{"nums":[2,2,3,2]}')).result, 3)
  assert.equal(buildTrace(parseInput('{"nums":[0,1,0,1,0,1,99]}')).result, 99)
  assert.equal(buildTrace(parseInput('{"nums":[-2,-2,-2,7]}')).result, 7)
})

test('validation rejects inputs that break the statement guarantee', () => {
  assert.throws(() => parseInput('[1]'), /"nums" array/)
  assert.throws(() => parseInput('{"nums":[1,1]}'), /1 more than a multiple of 3/)
  assert.throws(() => parseInput('{"nums":[1,2,3,4]}'), /appear once and every other value must appear three times/)
  assert.throws(() => parseInput('{"nums":[1,1,2,2]}'), /appear once and every other value must appear three times/)
  assert.throws(() => parseInput('{"nums":[1.5]}'), /integers from -30000/)
})

test('every frame points at a pseudocode line and the python export is present', () => {
  const trace = buildTrace(parseInput('{"nums":[2,2,3,2]}'))
  for (const f of trace.frames) assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
  assert.match(python, /def single_number\(nums\):/)
})

test('seeded random triple-plus-single arrays match a count-map oracle', () => {
  let seed = 137
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const oracle = nums => {
    const counts = new Map()
    for (const v of nums) counts.set(v, (counts.get(v) || 0) + 1)
    return [...counts].find(([, c]) => c === 1)[0]
  }
  for (let t = 0; t < 200; t++) {
    const groups = 1 + rnd(9)
    const pool = Array.from({ length: 41 }, (_, i) => i - 20)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const values = pool.slice(0, groups + 1)
    const nums = [values[0]]
    for (const v of values.slice(1)) nums.push(v, v, v)
    for (let i = nums.length - 1; i > 0; i--) { const j = rnd(i + 1); [nums[i], nums[j]] = [nums[j], nums[i]] }
    assert.equal(buildTrace(parseInput(JSON.stringify({ nums }))).result, oracle(nums), JSON.stringify(nums))
  }
})
