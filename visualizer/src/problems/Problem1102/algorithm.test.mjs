import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const EXAMPLE = [[5, 4, 5], [1, 2, 6], [7, 4, 6]];
const SECOND = [[2, 2, 1, 2, 2, 2], [1, 2, 2, 2, 1, 2]];

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Independent oracle: the answer is the largest threshold t such that the top-left and bottom-right cells
// are connected through cells whose values are all at least t.
function oracle(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const thresholds = [...new Set(grid.flat())].sort((a, b) => b - a);
  for (const t of thresholds) {
    if (grid[0][0] < t) continue;
    const seen = new Set(["0,0"]);
    const stack = [[0, 0]];
    while (stack.length) {
      const [r, c] = stack.pop();
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] < t || seen.has(`${nr},${nc}`)) continue;
        seen.add(`${nr},${nc}`);
        stack.push([nr, nc]);
      }
    }
    if (seen.has(`${rows - 1},${cols - 1}`)) return t;
  }
  return -1;
}

test("the teaching example returns 4 and the second grid returns 2", () => {
  assert.equal(buildTrace(EXAMPLE).answer, 4);
  assert.equal(buildTrace(SECOND).answer, 2);
});

test("single cell and single row or column grids", () => {
  assert.equal(buildTrace([[7]]).answer, 7);
  assert.equal(buildTrace([[3, 9, 1, 8]]).answer, 1);
  assert.equal(buildTrace([[3], [9], [8]]).answer, 3);
});

test("the trace agrees with the threshold oracle on random grids", () => {
  let seed = 1102;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let trial = 0; trial < 300; trial += 1) {
    const rows = 1 + (next() % 5);
    const cols = 1 + (next() % 5);
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => next() % 20));
    assert.equal(buildTrace(grid).answer, oracle(grid), JSON.stringify(grid));
  }
});

test("parseInput accepts JSON text and arrays and rejects invalid grids", () => {
  assert.deepEqual(parseInput("[[1,2],[3,4]]"), [[1, 2], [3, 4]]);
  assert.throws(() => parseInput("[[1,2],[3]]"), /rectangular/);
  assert.throws(() => parseInput("[]"), /1 to 8 rows/);
  assert.throws(() => parseInput([[1.5]]), /integers/);
  assert.throws(() => parseInput([[-1]]), /0 to 1000/);
  assert.throws(() => parseInput(Array.from({ length: 9 }, () => [1])), /1 to 8 rows/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def maximumMinimumPath\(self, grid/);
});

test("every frame has a valid pseudocode line, python line, declared phase and message", () => {
  const trace = buildTrace(EXAMPLE);
  assert.ok(trace.frames.length > 0);
  for (const frame of trace.frames) {
    assert.ok(CODE_BY_LINE.has(frame.activeLine), `activeLine ${frame.activeLine} has no pseudocode`);
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PYTHON_LINES.length, `pythonLine ${frame.pythonLine}`);
    assert.ok(PYTHON_LINES[frame.pythonLine - 1].trim().length > 0, `pythonLine ${frame.pythonLine} is blank`);
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase} is declared`);
    assert.ok(frame.message.length > 0);
    assert.equal(frame.best.length, EXAMPLE.length);
  }
});

test("the final frame reports the answer", () => {
  const trace = buildTrace(EXAMPLE);
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.best[2][2], 4);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1102";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify(EXAMPLE), encoding: "utf8" });
  assert.equal(JSON.parse(output), 4);
});
