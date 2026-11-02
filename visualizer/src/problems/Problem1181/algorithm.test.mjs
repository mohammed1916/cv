import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Brute-force oracle: try every ordered pair of positions, merge word lists directly, and sort the distinct results.
function oracle(phrases) {
  const out = new Set();
  for (let i = 0; i < phrases.length; i += 1) {
    for (let j = 0; j < phrases.length; j += 1) {
      if (i === j) continue;
      const a = phrases[i].split(" ");
      const b = phrases[j].split(" ");
      if (a[a.length - 1] === b[0]) out.add([...a, ...b.slice(1)].join(" "));
    }
  }
  return [...out].sort();
}

test("the teaching example writing code and code rocks gives writing code rocks", () => {
  assert.deepEqual(buildTrace(["writing code", "code rocks"]).answer, ["writing code rocks"]);
});

test("a phrase can join itself only through a different position", () => {
  assert.deepEqual(buildTrace(["a", "a"]).answer, ["a"]);
  assert.deepEqual(buildTrace(["a"]).answer, []);
});

test("equal phrases at different positions both participate and results are distinct", () => {
  const phrases = ["mission statement", "statement of purpose", "mission statement", "purpose"];
  assert.deepEqual(buildTrace(phrases).answer, oracle(phrases));
  assert.deepEqual(buildTrace(phrases).answer, ["mission statement of purpose", "statement of purpose"]);
});

test("the trace agrees with the oracle on random phrase lists", () => {
  let seed = 1181;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  const vocabulary = ["ab", "bc", "cd", "a", "b"];
  for (let trial = 0; trial < 300; trial += 1) {
    const count = 1 + (next() % 6);
    const phrases = Array.from({ length: count }, () => {
      const words = 1 + (next() % 3);
      return Array.from({ length: words }, () => vocabulary[next() % vocabulary.length]).join(" ");
    });
    assert.deepEqual(buildTrace(phrases).answer, oracle(phrases), JSON.stringify(phrases));
  }
});

test("parseInput accepts JSON text and arrays and rejects invalid phrases", () => {
  assert.deepEqual(parseInput('["a b","b c"]'), ["a b", "b c"]);
  assert.throws(() => parseInput([]), /1 to 12 phrases/);
  assert.throws(() => parseInput(["Upper case"]), /lowercase words/);
  assert.throws(() => parseInput(["two  spaces"]), /lowercase words/);
  assert.throws(() => parseInput(["a b c d e f g"]), /at most 6 words/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def beforeAndAfterPuzzles\(self, phrases/);
});

test("every frame has a valid pseudocode line, python line, declared phase and message", () => {
  const trace = buildTrace(["writing code", "code rocks", "rocks n roll"]);
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
  const trace = buildTrace(["writing code", "code rocks"]);
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.deepEqual(last.result, ["writing code rocks"]);
});

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1181";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify(["writing code", "code rocks"]), encoding: "utf8" });
  assert.deepEqual(JSON.parse(output), ["writing code rocks"]);
});
