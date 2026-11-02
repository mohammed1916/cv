import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const EXAMPLE = [[1, 2, 3, 4, 5], [2, 4, 5, 8, 10], [3, 5, 7, 9, 11], [1, 3, 5, 7, 9]];

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Brute-force oracle: test every value in the first row against every other row.
function oracle(mat) {
  for (const value of mat[0]) {
    if (mat.every((row) => row.includes(value))) return value;
  }
  return -1;
}

test("the teaching example returns 5", () => {
  assert.equal(buildTrace(EXAMPLE).answer, 5);
});

test("edge cases: one row, no common value, and a common first value", () => {
  assert.equal(buildTrace([[4, 9, 12]]).answer, 4);
  assert.equal(buildTrace([[1, 2], [3, 4]]).answer, -1);
  assert.equal(buildTrace([[1, 2, 3], [2, 3, 4], [2, 3, 5]]).answer, 2);
  assert.equal(buildTrace([[0], [0], [0]]).answer, 0);
});

test("the trace agrees with the brute-force oracle on random strictly increasing matrices", () => {
  let seed = 1198;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let trial = 0; trial < 400; trial += 1) {
    const rows = 1 + (next() % 4);
    const cols = 1 + (next() % 6);
    const mat = Array.from({ length: rows }, () => {
      const values = new Set();
      while (values.size < cols) values.add(next() % 12);
      return [...values].sort((a, b) => a - b);
    });
    assert.equal(buildTrace(mat).answer, oracle(mat), JSON.stringify(mat));
  }
});

test("parseInput accepts JSON text and arrays and rejects invalid matrices", () => {
  assert.deepEqual(parseInput("[[1,2],[3,4]]"), [[1, 2], [3, 4]]);
  assert.throws(() => parseInput("[]"), /1 to 6 rows/);
  assert.throws(() => parseInput([[1, 2], [3]]), /rectangular/);
  assert.throws(() => parseInput([[2, 1]]), /strictly increasing/);
  assert.throws(() => parseInput([[1, 1]]), /strictly increasing/);
  assert.throws(() => parseInput([[-1]]), /0 to 1000/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def smallestCommonElement\(self, mat/);
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
    assert.equal(frame.pointers.length, EXAMPLE.length);
  }
});

test("the final frame reports the answer", () => {
  const trace = buildTrace(EXAMPLE);
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.answer, 5);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1198";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify(EXAMPLE), encoding: "utf8" });
  assert.equal(JSON.parse(output), 5);
});
