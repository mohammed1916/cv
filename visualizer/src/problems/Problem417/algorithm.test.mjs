import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const OFFICIAL_1 = [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]];
const OFFICIAL_1_ANSWER = [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]];

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Independent oracle: a cell reaches an ocean if a non-increasing walk leads from it to that ocean's border.
function oracle(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  const answer = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const seen = new Set();
      const stack = [[r, c]];
      let pacific = false;
      let atlantic = false;
      while (stack.length) {
        const [y, x] = stack.pop();
        const id = `${y},${x}`;
        if (seen.has(id)) continue;
        seen.add(id);
        if (y === 0 || x === 0) pacific = true;
        if (y === rows - 1 || x === cols - 1) atlantic = true;
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
          if (heights[ny][nx] <= heights[y][x]) stack.push([ny, nx]);
        }
      }
      if (pacific && atlantic) answer.push([r, c]);
    }
  }
  return answer;
}

function sortCells(cells) {
  return cells.map((cell) => [cell[0], cell[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function solve(heights) {
  return buildTrace(heights).answer;
}

test("LeetCode official example 1 returns the published cells", () => {
  assert.deepEqual(solve(OFFICIAL_1), OFFICIAL_1_ANSWER);
});

test("LeetCode official example 2 ([[1]]) returns [[0,0]]", () => {
  assert.deepEqual(solve([[1]]), [[0, 0]]);
});

test("a flat grid makes every cell reachable from both oceans", () => {
  assert.deepEqual(solve([[3, 3], [3, 3]]), [[0, 0], [0, 1], [1, 0], [1, 1]]);
});

test("parseInput accepts JSON text and arrays and rejects invalid grids", () => {
  assert.deepEqual(parseInput("[[1,2],[4,3]]"), [[1, 2], [4, 3]]);
  assert.deepEqual(parseInput([[1, 2], [4, 3]]), [[1, 2], [4, 3]]);
  assert.throws(() => parseInput("[]"), /at least one row/);
  assert.throws(() => parseInput("[[1,2],[3]]"), /rectangular/);
  assert.throws(() => parseInput("[[1.5]]"), /integer/);
  assert.throws(() => parseInput("not json"), /JSON/);
  assert.throws(() => parseInput(Array.from({ length: 21 }, () => [1])), /up to 20 rows/);
  assert.throws(() => parseInput([Array.from({ length: 21 }, () => 1)]), /up to 20 columns/);
});

test("the brute-force oracle agrees with the trace on random small grids", () => {
  let seed = 417;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let trial = 0; trial < 300; trial += 1) {
    const rows = 1 + (next() % 6);
    const cols = 1 + (next() % 6);
    const heights = Array.from({ length: rows }, () => Array.from({ length: cols }, () => next() % 5));
    assert.deepEqual(solve(heights), sortCells(oracle(heights)), `grid ${JSON.stringify(heights)}`);
  }
});

test("pseudocode code and python are complete and well formed", () => {
  assert.ok(code.length > 0);
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def pacificAtlantic\(self, heights/);
});

test("every frame has valid activeLine, pythonLine, phase, message and reach snapshot", () => {
  const trace = buildTrace(OFFICIAL_1);
  assert.ok(trace.frames.length > 0);
  for (const frame of trace.frames) {
    assert.ok(CODE_BY_LINE.has(frame.activeLine), `activeLine ${frame.activeLine} has no pseudocode`);
    assert.ok(Number.isInteger(frame.pythonLine), "pythonLine is an integer");
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= PYTHON_LINES.length, `pythonLine ${frame.pythonLine} in range`);
    assert.ok(PYTHON_LINES[frame.pythonLine - 1].trim().length > 0, `pythonLine ${frame.pythonLine} is not blank`);
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase} is declared`);
    assert.equal(typeof frame.message, "string");
    assert.ok(frame.message.length > 0);
    assert.ok(Array.isArray(frame.reach.pacific) && Array.isArray(frame.reach.atlantic));
    assert.ok(Array.isArray(frame.reach.frontier));
  }
});

test("every frame's pseudocode line is also mapped when the map covers it", () => {
  const trace = buildTrace(OFFICIAL_1);
  for (const frame of trace.frames) {
    if (pythonLineMap[frame.activeLine] !== undefined) {
      assert.ok(pythonLineMap[frame.activeLine] >= 1 && pythonLineMap[frame.activeLine] <= PYTHON_LINES.length);
    }
  }
});

test("the final frame reports the answer and the answer equals the trace result", () => {
  const trace = buildTrace(OFFICIAL_1);
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.deepEqual(last.reach.answer, OFFICIAL_1_ANSWER);
  assert.deepEqual(trace.answer, OFFICIAL_1_ANSWER);
});

test("the python first example prints the official answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/pilot-417";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify(OFFICIAL_1), encoding: "utf8" });
  assert.deepEqual(JSON.parse(output), OFFICIAL_1_ANSWER);
});
