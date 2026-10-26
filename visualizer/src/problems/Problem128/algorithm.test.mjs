import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseNumsInput,
  buildConsecutiveStory,
} from "./algorithm.js";

test("CODE matches the standard Python solution lines", () => {
  assert.equal(CODE.length, 12);
  assert.ok(CODE[0].includes("def longestConsecutive(nums):"));
  assert.ok(CODE[1].includes("num_set = set(nums)"));
  assert.ok(CODE[2].includes("longest = 0"));
  assert.ok(CODE[3].includes("for num in num_set:"));
  assert.ok(CODE[4].includes("if num - 1 not in num_set:"));
  assert.ok(CODE[5].includes("curr = num"));
  assert.ok(CODE[6].includes("streak = 1"));
  assert.ok(CODE[7].includes("while curr + 1 in num_set:"));
  assert.ok(CODE[8].includes("curr += 1"));
  assert.ok(CODE[9].includes("streak += 1"));
  assert.ok(CODE[10].includes("longest = max(longest, streak)"));
  assert.ok(CODE[11].includes("return longest"));
});

test("parseNumsInput validates and parses array or comma-separated integers", () => {
  // Valid JSON array
  assert.deepEqual(parseNumsInput("[100, 4, 200, 1, 3, 2]"), [100, 4, 200, 1, 3, 2]);
  assert.deepEqual(parseNumsInput("[]"), []);
  assert.deepEqual(parseNumsInput([]), []);
  assert.deepEqual(parseNumsInput([7]), [7]);
  assert.deepEqual(parseNumsInput("[ -5, -4, 0, 3 ]"), [-5, -4, 0, 3]);

  // Valid comma-separated string
  assert.deepEqual(parseNumsInput("100, 4, 200, 1, 3, 2"), [100, 4, 200, 1, 3, 2]);
  assert.deepEqual(parseNumsInput("10, 20, 30"), [10, 20, 30]);
  assert.deepEqual(parseNumsInput("-2, -3, -1"), [-2, -3, -1]);

  // Array input directly
  assert.deepEqual(parseNumsInput([100, 4, 200, 1, 3, 2]), [100, 4, 200, 1, 3, 2]);
});

test("parseNumsInput rejects invalid inputs", () => {
  // Empty or null
  assert.throws(() => parseNumsInput(null), /Input cannot be empty/);
  assert.throws(() => parseNumsInput(undefined), /Input cannot be empty/);
  assert.throws(() => parseNumsInput(""), /Input cannot be empty/);
  assert.throws(() => parseNumsInput("   "), /Input cannot be empty/);

  // Non-array and non-string
  assert.throws(() => parseNumsInput(123), /Input must be an array or comma-separated string/);
  assert.throws(() => parseNumsInput({ a: 1 }), /Input must be an array or comma-separated string/);
  assert.throws(() => parseNumsInput(true), /Input must be an array or comma-separated string/);

  // Invalid JSON format
  assert.throws(() => parseNumsInput("[1, 2,"), /Invalid JSON format/);
  assert.throws(() => parseNumsInput("[1, 2"), /Invalid JSON format/);
  assert.throws(() => parseNumsInput("{1, 2}"), /Invalid JSON format/);
  assert.throws(() => parseNumsInput('{"nums": [1, 2]}'), /Input must be an array/);

  // Non-integer numbers
  assert.throws(() => parseNumsInput("[1, 2.5, 3]"), /must be an integer/);
  assert.throws(() => parseNumsInput("1, 2.5, 3"), /must be an integer/);

  // Non-numeric elements
  assert.throws(() => parseNumsInput('[1, "a", 3]'), /must be an integer/);
  assert.throws(() => parseNumsInput("[1, 'a', 3]"), /Invalid JSON format/);
  assert.throws(() => parseNumsInput("1, foo, 3"), /Invalid integer/);
  assert.throws(() => parseNumsInput("1, , 3"), /Empty value in comma-separated numbers/);
  assert.throws(() => parseNumsInput([1, null, 3]), /must be an integer/);
  assert.throws(() => parseNumsInput([1, undefined, 3]), /must be an integer/);
  assert.throws(() => parseNumsInput([1, true, 3]), /must be an integer/);

  // Out of bounds
  assert.throws(() => parseNumsInput([2000000000]), /exceeds allowed range/);
  assert.throws(() => parseNumsInput([-2000000000]), /exceeds allowed range/);

  // Exceeds max length
  const huge = Array.from({ length: 101 }, (_, i) => i);
  assert.throws(() => parseNumsInput(huge), /Array exceeds maximum limit of 100/);
});

test("Example 1: [100, 4, 200, 1, 3, 2] yields longest streak 4 (sequence [1, 2, 3, 4])", () => {
  const story = buildConsecutiveStory([100, 4, 200, 1, 3, 2]);
  assert.equal(story.longestStreak, 4);
  assert.deepEqual(story.bestSequence, [1, 2, 3, 4]);
  assert.equal(story.uniqueSet.length, 6);
  assert.ok(story.uniqueSet.has(100));
  assert.ok(story.uniqueSet.has(4));
  assert.ok(story.uniqueSet.has(1));
  assert.equal(story.uniqueSet.size, 6);

  // Check frames
  assert.ok(story.frames.length > 0);
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[0].activeLine, 2);
  assert.equal(story.frames[1].phase, "init");
  assert.equal(story.frames[1].activeLine, 3);

  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.activeLine, 12);
  assert.equal(doneFrame.longest, 4);
  assert.deepEqual(doneFrame.bestSequence, [1, 2, 3, 4]);

  // Check that 4, 3, 2 were skipped as starts because their left neighbor exists
  const skip4 = story.frames.find((f) => f.num === 4 && f.hasLeftNeighbor === true);
  assert.ok(skip4, "4 should be skipped because 3 is in the set");
  assert.equal(skip4.leftNeighbor, 3);

  const skip3 = story.frames.find((f) => f.num === 3 && f.hasLeftNeighbor === true);
  assert.ok(skip3, "3 should be skipped because 2 is in the set");
  assert.equal(skip3.leftNeighbor, 2);

  const skip2 = story.frames.find((f) => f.num === 2 && f.hasLeftNeighbor === true);
  assert.ok(skip2, "2 should be skipped because 1 is in the set");
  assert.equal(skip2.leftNeighbor, 1);

  // Check that 1 was identified as a sequence start and expanded
  const start1 = story.frames.find((f) => f.num === 1 && f.hasLeftNeighbor === false && f.phase === "scan");
  assert.ok(start1, "1 should be detected as a sequence start");
  assert.equal(start1.leftNeighbor, 0);

  // Expansion steps for 1
  const expandSteps = story.frames.filter((f) => f.num === 1 && f.phase === "expand");
  assert.equal(expandSteps.length, 3); // 2, 3, 4
  assert.equal(expandSteps[0].curr, 2);
  assert.equal(expandSteps[1].curr, 3);
  assert.equal(expandSteps[2].curr, 4);
});

test("Example 2: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] yields streak 9 with duplicates handled", () => {
  const story = buildConsecutiveStory("[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]");
  assert.equal(story.longestStreak, 9);
  assert.deepEqual(story.bestSequence, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  // 10 input numbers, 9 unique
  assert.equal(story.nums.length, 10);
  assert.equal(story.uniqueSet.length, 9);
  assert.equal(story.uniqueSet.size, 9);

  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.longest, 9);
  assert.deepEqual(doneFrame.bestSequence, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

test("handles empty array correctly", () => {
  const story = buildConsecutiveStory("[]");
  assert.equal(story.longestStreak, 0);
  assert.deepEqual(story.bestSequence, []);
  assert.equal(story.nums.length, 0);
  assert.equal(story.uniqueSet.length, 0);
  assert.equal(story.uniqueSet.size, 0);
  assert.equal(story.frames.length, 3);
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[1].phase, "init");
  assert.equal(story.frames[2].phase, "done");
  assert.equal(story.frames[2].longest, 0);
});

test("handles single element array", () => {
  const story = buildConsecutiveStory([42]);
  assert.equal(story.longestStreak, 1);
  assert.deepEqual(story.bestSequence, [42]);
  assert.equal(story.uniqueSet.length, 1);

  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.longest, 1);
  assert.deepEqual(doneFrame.bestSequence, [42]);
});

test("handles negative numbers correctly", () => {
  const story = buildConsecutiveStory("[-2, -3, -1, 10, 11]");
  assert.equal(story.longestStreak, 3);
  assert.deepEqual(story.bestSequence, [-3, -2, -1]);

  const story2 = buildConsecutiveStory([-1, 0, 1]);
  assert.equal(story2.longestStreak, 3);
  assert.deepEqual(story2.bestSequence, [-1, 0, 1]);
});

test("handles duplicates and uniform arrays", () => {
  const story = buildConsecutiveStory([5, 5, 5, 5, 5]);
  assert.equal(story.longestStreak, 1);
  assert.deepEqual(story.bestSequence, [5]);
  assert.equal(story.uniqueSet.length, 1);

  const story2 = buildConsecutiveStory([1, 2, 0, 1]);
  assert.equal(story2.longestStreak, 3);
  assert.deepEqual(story2.bestSequence, [0, 1, 2]);
});

test("handles disjoint numbers with no consecutive pairs", () => {
  const story = buildConsecutiveStory([10, 30, 50, 70]);
  assert.equal(story.longestStreak, 1);
  assert.deepEqual(story.bestSequence, [10]);
});

test("trace frames are strictly immutable and valid", () => {
  const story = buildConsecutiveStory([4, 1, 2, 3]);

  for (const frame of story.frames) {
    assert.ok(typeof frame.activeLine === "number", "activeLine must be number");
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 12, "activeLine within [1, 12]");
    assert.ok(typeof frame.phase === "string", "phase must be string");
    assert.ok(typeof frame.message === "string", "message must be string");
    assert.ok(typeof frame.explanation === "string", "explanation must be string");
    assert.ok(Array.isArray(frame.currentSequence), "currentSequence must be array");
    assert.ok(Array.isArray(frame.bestSequence), "bestSequence must be array");
    assert.ok(Array.isArray(frame.visitedStarts), "visitedStarts must be array");
    assert.ok(Array.isArray(frame.skippedNums), "skippedNums must be array");
  }

  // Modifying an array from an earlier frame does not mutate later frames
  const frameA = story.frames[3];
  const frameB = story.frames[story.frames.length - 1];
  assert.notEqual(frameA.bestSequence, frameB.bestSequence);
});
