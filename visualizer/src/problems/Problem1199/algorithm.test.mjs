import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const EXAMPLE = { blocks: [1, 2, 3], split: 1 };

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Brute-force oracle: a set of blocks handed to one worker either takes one block, or the worker splits
// (costing split time) and the two halves are built in parallel. Try every way to split the set.
function oracle(blocks, split) {
  const memo = new Map();
  const best = (items) => {
    const key = [...items].sort((a, b) => a - b).join(",");
    if (memo.has(key)) return memo.get(key);
    let result;
    if (items.length === 1) {
      result = items[0];
    } else {
      result = Infinity;
      const total = 1 << items.length;
      for (let mask = 1; mask < total - 1; mask += 1) {
        const left = items.filter((_, i) => (mask >> i) & 1);
        const right = items.filter((_, i) => !((mask >> i) & 1));
        result = Math.min(result, split + Math.max(best(left), best(right)));
      }
    }
    memo.set(key, result);
    return result;
  };
  return best(blocks);
}

test("the teaching example [1,2,3] with split 1 takes 4", () => {
  assert.equal(buildTrace(EXAMPLE).answer, 4);
  assert.equal(oracle(EXAMPLE.blocks, EXAMPLE.split), 4);
});

test("a single block takes its own time, and free splits let equal blocks finish in one block time", () => {
  assert.equal(buildTrace({ blocks: [7], split: 5 }).answer, 7);
  assert.equal(buildTrace({ blocks: [1, 1, 1, 1], split: 0 }).answer, 1);
  assert.equal(oracle([1, 1, 1, 1], 0), 1);
});

test("the trace agrees with the subset oracle on random inputs", () => {
  let seed = 1199;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let trial = 0; trial < 300; trial += 1) {
    const count = 1 + (next() % 6);
    const blocks = Array.from({ length: count }, () => next() % 20);
    const split = next() % 10;
    assert.equal(buildTrace({ blocks, split }).answer, oracle(blocks, split), JSON.stringify({ blocks, split }));
  }
});

test("every merge in the trace builds the pair at the slower time plus the split", () => {
  const trace = buildTrace({ blocks: [4, 9, 2, 7], split: 3 });
  for (const merge of trace.merges) {
    assert.equal(merge.merged, merge.second + 3);
    assert.ok(merge.first <= merge.second);
  }
  assert.equal(trace.merges.length, 3);
  assert.equal(trace.answer, oracle([4, 9, 2, 7], 3));
});

test("parseInput accepts objects and JSON text and rejects invalid input", () => {
  assert.deepEqual(parseInput('{"blocks":[1,2],"split":1}'), { blocks: [1, 2], split: 1 });
  assert.throws(() => parseInput({ blocks: [], split: 1 }), /1 to 8 times/);
  assert.throws(() => parseInput({ blocks: [1.5], split: 1 }), /integers/);
  assert.throws(() => parseInput({ blocks: [1], split: -1 }), /split is an integer/);
  assert.throws(() => parseInput("[1,2]"), /object with blocks and split/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def minBuildTime\(self, blocks: list\[int\], split: int\)/);
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
  }
});

test("the final frame reports the answer", () => {
  const trace = buildTrace(EXAMPLE);
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.answer, 4);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1199";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify(EXAMPLE), encoding: "utf8" });
  assert.equal(JSON.parse(output), 4);
});
