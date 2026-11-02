import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Brute-force oracle: try every way to split the elements (in index order) into groups.
// Each group must be strictly increasing and hold at least k elements.
function oracle(nums, k) {
  const groups = [];
  const search = (i) => {
    if (i === nums.length) return groups.every((group) => group.length >= k);
    for (const group of groups) {
      if (group[group.length - 1] < nums[i]) {
        group.push(nums[i]);
        const ok = search(i + 1);
        group.pop();
        if (ok) return true;
      }
    }
    groups.push([nums[i]]);
    const ok = search(i + 1);
    groups.pop();
    return ok;
  };
  return search(0);
}

test("the teaching example [1,2,2,3,3,4] with k = 3 is possible", () => {
  assert.equal(buildTrace({ nums: [1, 2, 2, 3, 3, 4], k: 3 }).answer, true);
});

test("the teaching example [1,1,1,2,3] with k = 2 is impossible", () => {
  assert.equal(buildTrace({ nums: [1, 1, 1, 2, 3], k: 2 }).answer, false);
});

test("a single run of distinct values is one sequence", () => {
  assert.equal(buildTrace({ nums: [1, 2, 3, 4], k: 4 }).answer, true);
  assert.equal(buildTrace({ nums: [1, 2, 3, 4], k: 5 }).answer, false);
});

test("the trace agrees with the brute-force oracle on random nondecreasing arrays", () => {
  let seed = 1121;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let trial = 0; trial < 400; trial += 1) {
    const n = 1 + (next() % 7);
    const nums = Array.from({ length: n }, () => next() % 4).sort((a, b) => a - b);
    const k = 1 + (next() % 4);
    const trace = buildTrace({ nums, k });
    assert.equal(trace.answer, oracle(nums, k), `nums ${JSON.stringify(nums)} k ${k}`);
  }
});

test("every verification of a constructed division passes", () => {
  let seed = 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let trial = 0; trial < 300; trial += 1) {
    const n = 1 + (next() % 12);
    const nums = Array.from({ length: n }, () => next() % 5).sort((a, b) => a - b);
    const k = 1 + (next() % 3);
    const trace = buildTrace({ nums, k });
    for (const frame of trace.frames) {
      if (frame.phase === "verify") assert.equal(frame.verdict, true, JSON.stringify(nums));
    }
  }
});

test("parseInput accepts objects and JSON text and rejects invalid input", () => {
  assert.deepEqual(parseInput('{"nums":[1,2],"k":1}'), { nums: [1, 2], k: 1 });
  assert.throws(() => parseInput("[1,2]"), /object with nums and k/);
  assert.throws(() => parseInput({ nums: [2, 1], k: 1 }), /nondecreasing/);
  assert.throws(() => parseInput({ nums: [1], k: 0 }), /k is an integer from 1 to 16/);
  assert.throws(() => parseInput({ nums: [], k: 1 }), /1 to 16 values/);
  assert.throws(() => parseInput({ nums: [1.5], k: 1 }), /integers/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def canDivideIntoIncreasingSequences\(self, nums: list\[int\], k: int\)/);
});

test("every frame has a valid pseudocode line, python line, declared phase and message", () => {
  for (const input of [{ nums: [1, 2, 2, 3, 3, 4], k: 3 }, { nums: [1, 1, 1, 2, 3], k: 2 }]) {
    const trace = buildTrace(input);
    assert.ok(trace.frames.length > 0);
    for (const frame of trace.frames) {
      assert.ok(CODE_BY_LINE.has(frame.activeLine), `activeLine ${frame.activeLine} has no pseudocode`);
      assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PYTHON_LINES.length, `pythonLine ${frame.pythonLine}`);
      assert.ok(PYTHON_LINES[frame.pythonLine - 1].trim().length > 0, `pythonLine ${frame.pythonLine} is blank`);
      assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase} is declared`);
      assert.ok(frame.message.length > 0);
    }
  }
});

test("the final frame reports the answer", () => {
  const trace = buildTrace({ nums: [1, 2, 2, 3, 3, 4], k: 3 });
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.verdict, true);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1121";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify({ nums: [1, 2, 2, 3, 3, 4], k: 3 }), encoding: "utf8" });
  assert.equal(JSON.parse(output), true);
});
