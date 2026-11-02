import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));
const MOVES = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

// Oracle: the same breadth-first search, but on a much larger window, so the window size cannot matter.
function oracle(x, y, extra = 12) {
  const margin = Math.max(Math.abs(x), Math.abs(y)) + extra;
  const dist = new Map([["0,0", 0]]);
  const queue = [[0, 0]];
  for (let head = 0; head < queue.length; head += 1) {
    const [r, c] = queue[head];
    if (r === x && c === y) return dist.get(`${r},${c}`);
    for (const [dr, dc] of MOVES) {
      const nr = r + dr;
      const nc = c + dc;
      if (Math.abs(nr) > margin || Math.abs(nc) > margin || dist.has(`${nr},${nc}`)) continue;
      dist.set(`${nr},${nc}`, dist.get(`${r},${c}`) + 1);
      queue.push([nr, nc]);
    }
  }
  return -1;
}

test("the teaching examples: (2,1) takes 1 move, (-1,2) takes 1 move, (5,5) takes 4 moves", () => {
  assert.equal(buildTrace({ x: 2, y: 1 }).answer, 1);
  assert.equal(buildTrace({ x: -1, y: 2 }).answer, 1);
  assert.equal(buildTrace({ x: 5, y: 5 }).answer, 4);
});

test("the origin is zero moves and (1,1) takes 2 moves", () => {
  assert.equal(buildTrace({ x: 0, y: 0 }).answer, 0);
  assert.equal(buildTrace({ x: 1, y: 1 }).answer, 2);
});

test("the window answer matches a much larger window for every target in the visualization cap", () => {
  for (let x = -12; x <= 12; x += 1) {
    for (let y = -12; y <= 12; y += 1) {
      assert.equal(buildTrace({ x, y }).answer, oracle(x, y), `target (${x}, ${y})`);
    }
  }
});

test("parseInput accepts objects and JSON text and rejects coordinates outside the cap", () => {
  assert.deepEqual(parseInput('{"x":2,"y":1}'), { x: 2, y: 1 });
  assert.throws(() => parseInput({ x: 13, y: 0 }), /-12 to 12/);
  assert.throws(() => parseInput({ x: 1.5, y: 0 }), /integer/);
  assert.throws(() => parseInput("[1,2]"), /object with x and y/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def minKnightMoves\(self, x: int, y: int\)/);
});

test("every frame has a valid pseudocode line, python line, declared phase and message", () => {
  const trace = buildTrace({ x: 5, y: 5 });
  assert.ok(trace.frames.length > 0);
  for (const frame of trace.frames) {
    assert.ok(CODE_BY_LINE.has(frame.activeLine), `activeLine ${frame.activeLine} has no pseudocode`);
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PYTHON_LINES.length, `pythonLine ${frame.pythonLine}`);
    assert.ok(PYTHON_LINES[frame.pythonLine - 1].trim().length > 0, `pythonLine ${frame.pythonLine} is blank`);
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase} is declared`);
    assert.ok(frame.message.length > 0);
    assert.ok(frame.discovered <= trace.order.length);
  }
});

test("the final frame reports the answer", () => {
  const trace = buildTrace({ x: 5, y: 5 });
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(trace.answer, 4);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1197";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify({ x: 5, y: 5 }), encoding: "utf8" });
  assert.equal(JSON.parse(output), 4);
});
