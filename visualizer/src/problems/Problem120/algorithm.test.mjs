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

// ─── Statement contract tests (parseInput / buildTrace / python) ───
import { parseInput, buildTrace, code, python } from './algorithm.js'

test('statement examples', () => {
  assert.equal(buildTrace(parseInput('{"triangle":[[2],[3,4],[6,5,7],[4,1,8,3]]}')).result, 11)
  assert.equal(buildTrace(parseInput('{"triangle":[[-10]]}')).result, -10)
  assert.equal(buildTrace(parseInput('{"triangle":[[1],[2,3]]}')).result, 3)
})

test('validation rejects malformed input with clear errors', () => {
  assert.throws(() => parseInput('[[1]]'), /object with a "triangle" array/)
  assert.throws(() => parseInput('{"triangle":[[1],[2]]}'), /Row 1 must have exactly 2 entries/)
  assert.throws(() => parseInput('{"triangle":[[1.5]]}'), /integers between/)
  assert.throws(() => parseInput('{"triangle":[]}'), /between 1 and 30 rows/)
})

test('every frame points at a pseudocode line and the python export is present', () => {
  const trace = buildTrace(parseInput('{"triangle":[[2],[3,4],[6,5,7],[4,1,8,3]]}'))
  for (const f of trace.frames) assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
  assert.match(python, /def minimum_total\(triangle\):/)
})

test('seeded random triangles match a top-down exhaustive path oracle', () => {
  let seed = 120
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const exhaustive = (tri, r = 0, k = 0) => {
    if (r === tri.length - 1) return tri[r][k]
    return tri[r][k] + Math.min(exhaustive(tri, r + 1, k), exhaustive(tri, r + 1, k + 1))
  }
  for (let t = 0; t < 150; t++) {
    const rows = 1 + rnd(7)
    const triangle = Array.from({ length: rows }, (_, r) => Array.from({ length: r + 1 }, () => rnd(41) - 20))
    assert.equal(buildTrace(parseInput(JSON.stringify({ triangle }))).result, exhaustive(triangle), JSON.stringify(triangle))
  }
})
