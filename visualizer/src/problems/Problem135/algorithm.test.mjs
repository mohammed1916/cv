import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseRatingsInput,
  buildCandyStory,
} from "./algorithm.js";

test("CODE matches the standard Python two-pass candy solution lines", () => {
  assert.equal(CODE.length, 10);
  assert.ok(CODE[0].includes("def candy(ratings):"));
  assert.ok(CODE[1].includes("n = len(ratings)"));
  assert.ok(CODE[2].includes("candies = [1] * n"));
  assert.ok(CODE[3].includes("for i in range(1, n):"));
  assert.ok(CODE[4].includes("if ratings[i] > ratings[i-1]:"));
  assert.ok(CODE[5].includes("candies[i] = candies[i-1] + 1"));
  assert.ok(CODE[6].includes("for i in range(n-2, -1, -1):"));
  assert.ok(CODE[7].includes("if ratings[i] > ratings[i+1]:"));
  assert.ok(CODE[8].includes("candies[i] = max(candies[i], candies[i+1] + 1)"));
  assert.ok(CODE[9].includes("return sum(candies)"));
});

test("parseRatingsInput validates inputs and formats strictly", () => {
  // Empty / null inputs
  assert.throws(() => parseRatingsInput(""), /Input cannot be empty/);
  assert.throws(() => parseRatingsInput("   "), /Input cannot be empty/);
  assert.throws(() => parseRatingsInput(null), /Input cannot be empty/);
  assert.throws(() => parseRatingsInput(undefined), /Input cannot be empty/);

  // Empty array
  assert.throws(
    () => parseRatingsInput("[]"),
    /Ratings array must contain at least 1 rating/,
  );
  assert.throws(
    () => parseRatingsInput([]),
    /Ratings array must contain at least 1 rating/,
  );

  // Invalid JSON format
  assert.throws(
    () => parseRatingsInput("[1, 2,"),
    /Invalid JSON format/,
  );
  assert.throws(
    () => parseRatingsInput('{"ratings": [1, 2]}'),
    /Ratings must be an array/,
  );

  // Comma-separated parsing
  const fromCsv = parseRatingsInput("1, 0, 2");
  assert.deepEqual(fromCsv, [1, 0, 2]);

  assert.throws(
    () => parseRatingsInput("1, , 2"),
    /Empty rating value in comma-separated input/,
  );
  assert.throws(
    () => parseRatingsInput("1, foo, 2"),
    /Invalid rating number/,
  );

  // Non-integers and negatives
  assert.throws(
    () => parseRatingsInput("[1, 2.5, 3]"),
    /must be an integer/,
  );
  assert.throws(
    () => parseRatingsInput("[-1, 0, 2]"),
    /cannot be negative/,
  );
  assert.throws(
    () => parseRatingsInput("[1, 100001]"),
    /exceeds maximum limit of 100,000/,
  );

  // Array length exceeding 100
  const largeArray = new Array(101).fill(1);
  assert.throws(
    () => parseRatingsInput(largeArray),
    /Ratings array exceeds limit/,
  );
});

test("example 1: valley [1, 0, 2] gives [2, 1, 2] with sum 5", () => {
  const story = buildCandyStory("[1, 0, 2]");
  assert.deepEqual(story.ratings, [1, 0, 2]);
  assert.deepEqual(story.candies, [2, 1, 2]);
  assert.equal(story.totalCandies, 5);

  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.totalCandies, 5);
  assert.deepEqual(doneFrame.candies, [2, 1, 2]);
  assert.equal(doneFrame.activeLine, 10);
});

test("example 2: plateau [1, 2, 2] gives [1, 2, 1] with sum 4", () => {
  const story = buildCandyStory([1, 2, 2]);
  assert.deepEqual(story.ratings, [1, 2, 2]);
  assert.deepEqual(story.candies, [1, 2, 1]);
  assert.equal(story.totalCandies, 4);

  // Check that index 2 did NOT get 3 candies because equal rating does not require more candies
  const leftPassCompareFrame = story.frames.find(
    (f) => f.phase === "compare" && f.pass === "left-to-right" && f.i === 2,
  );
  assert.ok(leftPassCompareFrame);
  assert.equal(leftPassCompareFrame.conditionMet, false);
});

test("two peaks: [1, 3, 2, 2, 1] gives [1, 2, 1, 2, 1] with sum 7", () => {
  const story = buildCandyStory("[1, 3, 2, 2, 1]");
  assert.deepEqual(story.ratings, [1, 3, 2, 2, 1]);
  assert.deepEqual(story.candies, [1, 2, 1, 2, 1]);
  assert.equal(story.totalCandies, 7);
});

test("single child: [5] gives [1] with sum 1", () => {
  const story = buildCandyStory("[5]");
  assert.deepEqual(story.ratings, [5]);
  assert.deepEqual(story.candies, [1]);
  assert.equal(story.totalCandies, 1);

  // Line 2 (n=len), Line 3 (candies=[1]), Line 10 (return sum)
  assert.equal(story.frames.length, 3);
  assert.equal(story.frames[0].activeLine, 2);
  assert.equal(story.frames[1].activeLine, 3);
  assert.equal(story.frames[2].activeLine, 10);
});

test("all equal ratings: [3, 3, 3, 3] gives [1, 1, 1, 1] with sum 4", () => {
  const story = buildCandyStory("[3, 3, 3, 3]");
  assert.deepEqual(story.candies, [1, 1, 1, 1]);
  assert.equal(story.totalCandies, 4);

  // No update frames should be triggered in either pass
  const updateFrames = story.frames.filter((f) => f.phase === "update");
  assert.equal(updateFrames.length, 0);
});

test("strictly increasing ratings: [1, 2, 3, 4, 5] gives [1, 2, 3, 4, 5] with sum 15", () => {
  const story = buildCandyStory([1, 2, 3, 4, 5]);
  assert.deepEqual(story.candies, [1, 2, 3, 4, 5]);
  assert.equal(story.totalCandies, 15);

  // In strictly increasing, left pass updates 4 times, right pass updates 0 times
  const leftUpdates = story.frames.filter(
    (f) => f.phase === "update" && f.pass === "left-to-right",
  );
  assert.equal(leftUpdates.length, 4);

  const rightUpdates = story.frames.filter(
    (f) => f.phase === "update" && f.pass === "right-to-left",
  );
  assert.equal(rightUpdates.length, 0);
});

test("strictly decreasing ratings: [5, 4, 3, 2, 1] gives [5, 4, 3, 2, 1] with sum 15", () => {
  const story = buildCandyStory([5, 4, 3, 2, 1]);
  assert.deepEqual(story.candies, [5, 4, 3, 2, 1]);
  assert.equal(story.totalCandies, 15);

  // In strictly decreasing, left pass updates 0 times, right pass updates 4 times
  const leftUpdates = story.frames.filter(
    (f) => f.phase === "update" && f.pass === "left-to-right",
  );
  assert.equal(leftUpdates.length, 0);

  const rightUpdates = story.frames.filter(
    (f) => f.phase === "update" && f.pass === "right-to-left",
  );
  assert.equal(rightUpdates.length, 4);
});

test("steep right slope requiring max() preservation: [1, 2, 5, 4, 3, 2, 1]", () => {
  // Left pass: [1, 2, 3, 1, 1, 1, 1]
  // Right pass: from right, candies need to be: [1, 2, 5, 4, 3, 2, 1]
  // At index 2 (rating 5), left pass gave 3, right neighbor requires 4 + 1 = 5
  // max(3, 5) chooses 5
  const story = buildCandyStory([1, 2, 5, 4, 3, 2, 1]);
  assert.deepEqual(story.candies, [1, 2, 5, 4, 3, 2, 1]);
  assert.equal(story.totalCandies, 18);

  // Find update frame at i=2 during right-to-left pass
  const updatePeakFrame = story.frames.find(
    (f) => f.phase === "update" && f.pass === "right-to-left" && f.i === 2,
  );
  assert.ok(updatePeakFrame);
  assert.equal(updatePeakFrame.previousCandy, 3);
  assert.equal(updatePeakFrame.neededCandy, 5);
  assert.equal(updatePeakFrame.newCandy, 5);
});

test("zero ratings are valid non-negative numbers", () => {
  const storyZero = buildCandyStory([0, 0, 0]);
  assert.deepEqual(storyZero.candies, [1, 1, 1]);
  assert.equal(storyZero.totalCandies, 3);

  const storyHill = buildCandyStory([0, 1, 0]);
  assert.deepEqual(storyHill.candies, [1, 2, 1]);
  assert.equal(storyHill.totalCandies, 4);
});

test("trace frames are immutable and frozen across execution steps", () => {
  const story = buildCandyStory([1, 0, 2]);
  assert.ok(Object.isFrozen(story.ratings));
  assert.ok(Object.isFrozen(story.candies));

  // Verify all frames and internal candies arrays are frozen
  for (const frame of story.frames) {
    assert.ok(Object.isFrozen(frame));
    assert.ok(Object.isFrozen(frame.candies));
  }

  // Verify frame 0 has initial state preserved
  const frame0 = story.frames[0];
  assert.deepEqual(frame0.candies, [1, 1, 1]);

  // Attempt to mutate frozen frame throws TypeError
  assert.throws(() => {
    frame0.i = 999;
  }, TypeError);

  // Attempt to mutate frame candies array throws TypeError
  assert.throws(() => {
    frame0.candies[0] = 999;
  }, TypeError);
});
