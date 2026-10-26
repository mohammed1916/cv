import test from "node:test";
import assert from "node:assert/strict";
import { parseTriangleInput, buildTriangleStory } from "./algorithm.js";

test("parseTriangleInput validates shapes and data types strictly", () => {
  assert.throws(() => parseTriangleInput(""), /Input cannot be empty/);
  assert.throws(
    () => parseTriangleInput('{ "foo": 1 }'),
    /Triangle must be an array/,
  );
  assert.throws(
    () => parseTriangleInput("[[1], [2]]"),
    /Row 1 must contain exactly 2 elements/,
  );
  assert.throws(() => parseTriangleInput('[[1], [2, "3"]]'), /Invalid integer/);
  assert.throws(() => parseTriangleInput("[[1], [2, 3.5]]"), /Invalid integer/);

  const valid = parseTriangleInput("[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]");
  assert.equal(valid.length, 4);
  assert.deepEqual(valid[2], [6, 5, 7]);
});

test("handles empty and 1-element triangle", () => {
  const emptyStory = buildTriangleStory("[]");
  assert.equal(emptyStory.minTotal, 0);
  assert.equal(emptyStory.frames.length, 1);

  const singleStory = buildTriangleStory("[[-10]]");
  assert.equal(singleStory.minTotal, -10);
  assert.deepEqual(singleStory.bestPath, [{ row: 0, col: 0 }]);
  const lastFrame = singleStory.frames[singleStory.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.dp[0], -10);
});

test("standard example matches DP result and finds optimal route", () => {
  // Triangle:
  //    2
  //   3 4
  //  6 5 7
  // 4 1 8 3
  // Path: 2 -> 3 -> 5 -> 1 = 11
  const story = buildTriangleStory("[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]");
  assert.equal(story.minTotal, 11);
  assert.deepEqual(story.bestPath, [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 1 },
    { row: 3, col: 1 },
  ]);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.dp[0], 11);
  assert.deepEqual(lastFrame.highlightRoute, story.bestPath);
});

test("handles negative values, zeros, and ties", () => {
  // Triangle:
  //    -1
  //   2   3
  //  1 -1 -3
  // Paths:
  // -1 + 2 + 1 = 2
  // -1 + 2 + (-1) = 0
  // -1 + 3 + (-1) = 1
  // -1 + 3 + (-3) = -1  <-- minimum
  const story = buildTriangleStory("[[-1], [2, 3], [1, -1, -3]]");
  assert.equal(story.minTotal, -1);
  assert.deepEqual(story.bestPath, [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ]);
});

test("frames do not leak future writes and record DP evolution", () => {
  const story = buildTriangleStory("[[1], [2, 3], [4, 5, 6]]");
  // Init dp: [4, 5, 6]
  const initFrame = story.frames[0];
  assert.deepEqual(initFrame.dp, [4, 5, 6]);

  // At row 1, col 0: 2 + min(4, 5) = 6
  // At row 1, col 1: 3 + min(5, 6) = 8
  const updateFrames = story.frames.filter((f) => f.phase === "update");
  assert.equal(updateFrames.length, 3); // 2 in row 1, 1 in row 0
  assert.equal(updateFrames[0].dp[0], 6);
  assert.equal(updateFrames[0].dp[1], 5); // dp[1] not yet updated

  assert.equal(updateFrames[1].dp[1], 8);
  assert.equal(updateFrames[2].dp[0], 1 + Math.min(6, 8)); // 7
});
