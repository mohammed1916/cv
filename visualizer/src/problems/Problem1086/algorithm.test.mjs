import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const EXAMPLE = [[1, 91], [1, 92], [2, 93], [2, 97], [1, 60], [2, 77], [1, 95], [1, 88], [2, 100], [2, 95], [1, 70], [2, 80], [1, 99], [2, 88]];
const EXAMPLE_ANSWER = [[1, 93], [2, 94]];

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Brute-force oracle: sort each student's scores, take the five largest, and integer-divide the sum.
function oracle(items) {
  const byId = new Map();
  for (const [id, score] of items) byId.set(id, [...(byId.get(id) || []), score]);
  return [...byId.keys()].sort((a, b) => a - b).map((id) => {
    const top = [...byId.get(id)].sort((a, b) => b - a).slice(0, 5);
    return [id, Math.floor(top.reduce((sum, value) => sum + value, 0) / 5)];
  });
}

test("the teaching example averages each student's five best scores", () => {
  assert.deepEqual(buildTrace(EXAMPLE).answer, EXAMPLE_ANSWER);
});

test("exactly five records per student and repeated scores are handled", () => {
  assert.deepEqual(buildTrace([[1, 10], [1, 20], [1, 30], [1, 40], [1, 50], [2, 1], [2, 1], [2, 1], [2, 1], [2, 1]]).answer, [[1, 30], [2, 1]]);
  assert.deepEqual(buildTrace([[7, 100], [7, 100], [7, 100], [7, 100], [7, 100], [7, 100]]).answer, [[7, 100]]);
});

test("the answer is ordered by student id even when records arrive out of order", () => {
  const items = [[3, 50], [1, 60], [2, 70], [3, 50], [1, 60], [2, 70], [3, 50], [1, 60], [2, 70], [3, 50], [1, 60], [2, 70], [3, 50], [1, 60], [2, 70]];
  assert.deepEqual(buildTrace(items).answer, [[1, 60], [2, 70], [3, 50]]);
});

test("parseInput accepts JSON text and arrays and rejects invalid records", () => {
  assert.deepEqual(parseInput("[[1,5],[1,5],[1,5],[1,5],[1,5]]").length, 5);
  assert.throws(() => parseInput("[[1,1],[1,2],[1,3],[1,4]]"), /at least five records/);
  assert.throws(() => parseInput([[1, 1.5]]), /integer/);
  assert.throws(() => parseInput([[0, 1]]), /positive integer/);
  assert.throws(() => parseInput([[1, 1001]]), /0 to 1000/);
  assert.throws(() => parseInput("not json"), /JSON/);
  assert.throws(() => parseInput(Array.from({ length: 31 }, () => [1, 1])), /1 to 30/);
});

test("the brute-force oracle agrees with the trace on random inputs", () => {
  let seed = 1086;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let trial = 0; trial < 200; trial += 1) {
    const students = 1 + (next() % 3);
    const items = [];
    for (let id = 1; id <= students; id += 1) {
      const count = 5 + (next() % 4);
      for (let k = 0; k < count; k += 1) items.push([id, next() % 101]);
    }
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = next() % (i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    assert.deepEqual(buildTrace(items).answer, oracle(items), JSON.stringify(items));
  }
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def highFive\(self, items/);
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
    assert.equal(typeof frame.tops, "object");
  }
});

test("the final frame reports the answer", () => {
  const trace = buildTrace(EXAMPLE);
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.deepEqual(last.answer, EXAMPLE_ANSWER);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1086";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify(EXAMPLE), encoding: "utf8" });
  assert.deepEqual(JSON.parse(output), EXAMPLE_ANSWER);
});
