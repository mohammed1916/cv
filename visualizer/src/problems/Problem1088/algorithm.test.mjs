import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Brute-force oracle: test every integer from 1 to n by rotating its digits directly.
function oracle(n) {
  const map = { 0: "0", 1: "1", 6: "9", 8: "8", 9: "6" };
  let count = 0;
  for (let x = 1; x <= n; x += 1) {
    const digits = String(x);
    if ([...digits].some((ch) => !(ch in map))) continue;
    const rotated = Number([...digits].reverse().map((ch) => map[ch]).join(""));
    if (rotated !== x) count += 1;
  }
  return count;
}

test("the teaching example n = 20 finds 6, 9, 10, 16, 18, 19", () => {
  const trace = buildTrace("20");
  assert.equal(trace.answer, 6);
  assert.deepEqual(trace.nodes.filter((node) => node.confusing).map((node) => node.value).sort((a, b) => a - b), [6, 9, 10, 16, 18, 19]);
});

test("n = 100 and n = 1000 match the oracle", () => {
  assert.equal(buildTrace("100").answer, oracle(100));
  assert.equal(buildTrace("1000").answer, oracle(1000));
  assert.equal(oracle(100), 19);
});

test("small edge cases: n = 1 and n = 5 have no confusing numbers", () => {
  assert.equal(buildTrace("1").answer, 0);
  assert.equal(buildTrace("5").answer, 0);
});

test("the trace agrees with the oracle for every n from 1 to 150", () => {
  for (let n = 1; n <= 150; n += 1) {
    assert.equal(buildTrace(n).answer, oracle(n), `n = ${n}`);
  }
});

test("parseInput accepts integers and rejects values outside the visualization cap", () => {
  assert.equal(parseInput("20"), 20);
  assert.equal(parseInput(7), 7);
  assert.throws(() => parseInput("0"), /1 to 1000/);
  assert.throws(() => parseInput("1001"), /1 to 1000/);
  assert.throws(() => parseInput("2.5"), /integer/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def confusingNumberII\(self, n/);
});

test("every frame has a valid pseudocode line, python line, declared phase and message", () => {
  const trace = buildTrace("100");
  assert.ok(trace.frames.length > 0);
  for (const frame of trace.frames) {
    assert.ok(CODE_BY_LINE.has(frame.activeLine), `activeLine ${frame.activeLine} has no pseudocode`);
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PYTHON_LINES.length, `pythonLine ${frame.pythonLine}`);
    assert.ok(PYTHON_LINES[frame.pythonLine - 1].trim().length > 0, `pythonLine ${frame.pythonLine} is blank`);
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase} is declared`);
    assert.ok(frame.message.length > 0);
    assert.ok(frame.visitedCount <= trace.nodes.length);
  }
});

test("the final frame reports the count", () => {
  const trace = buildTrace("20");
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.count, 6);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1088";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: "20", encoding: "utf8" });
  assert.equal(JSON.parse(output), 6);
});
