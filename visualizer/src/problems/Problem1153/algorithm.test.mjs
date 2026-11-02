import test from "node:test";
import assert from "node:assert/strict";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const CODE_BY_LINE = new Map(code.map((entry) => [entry.line, entry.text]));
const PYTHON_LINES = python.split("\n");
const PHASE_IDS = new Set(phases.map((phase) => phase.id));

// Brute-force oracle over a small alphabet: breadth-first search over every string the operations can reach.
// An operation picks two letters x != y and replaces every x with y.
function oracle(str1, str2, letters) {
  const seen = new Set([str1]);
  const queue = [str1];
  while (queue.length) {
    const current = queue.shift();
    if (current === str2) return true;
    for (const x of letters) {
      for (const y of letters) {
        if (x === y) continue;
        const next = current.split(x).join(y);
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
  }
  return false;
}

function allStrings(length, letters) {
  if (length === 0) return [""];
  const shorter = allStrings(length - 1, letters);
  return shorter.flatMap((prefix) => letters.map((letter) => prefix + letter));
}

test("the teaching example abcd to bcda is possible because str2 leaves spare letters", () => {
  assert.equal(buildTrace({ str1: "abcd", str2: "bcda" }).answer, true);
});

test("zero operations: equal strings are always possible", () => {
  assert.equal(buildTrace({ str1: "abc", str2: "abc" }).answer, true);
});

test("a letter that maps to two different letters is impossible", () => {
  assert.equal(buildTrace({ str1: "aab", str2: "bcc" }).answer, false);
  const trace = buildTrace({ str1: "aab", str2: "bcc" });
  const last = trace.frames[trace.frames.length - 1];
  assert.equal(last.phase, "done");
  assert.equal(last.verdict, false);
});

test("the trace agrees with a breadth-first oracle on a three-letter alphabet", () => {
  const letters = ["a", "b", "c"];
  for (let length = 1; length <= 4; length += 1) {
    const strings = allStrings(length, letters);
    for (const str1 of strings) {
      for (const str2 of strings) {
        const expected = oracle(str1, str2, letters);
        assert.equal(buildTrace({ str1, str2 }, letters.length).answer, expected, `${str1} to ${str2}`);
      }
    }
  }
});

test("the full alphabet rule: when str2 uses every letter the transform is impossible", () => {
  assert.equal(buildTrace({ str1: "abc", str2: "bca" }, 3).answer, false);
  assert.equal(buildTrace({ str1: "abc", str2: "bca" }).answer, true);
});

test("parseInput accepts objects and JSON text and rejects invalid input", () => {
  assert.deepEqual(parseInput('{"str1":"ab","str2":"ba"}'), { str1: "ab", str2: "ba" });
  assert.throws(() => parseInput({ str1: "ab", str2: "a" }), /equal length/);
  assert.throws(() => parseInput({ str1: "AB", str2: "ab" }), /lowercase/);
  assert.throws(() => parseInput({ str1: "", str2: "" }), /1 to 12/);
  assert.throws(() => parseInput({ str1: "abcdefghijklm", str2: "abcdefghijklm" }), /1 to 12/);
  assert.throws(() => parseInput("[1,2]"), /object with str1 and str2/);
  assert.throws(() => parseInput("not json"), /JSON/);
});

test("pseudocode and python are complete and well formed", () => {
  code.forEach((entry, index) => assert.equal(entry.line, index + 1));
  assert.match(python, /class Solution:/);
  assert.match(python, /def canConvert\(self, str1: str, str2: str\)/);
});

test("every frame has a valid pseudocode line, python line, declared phase and message", () => {
  for (const input of [{ str1: "abcd", str2: "bcda" }, { str1: "aab", str2: "bbc" }, { str1: "xyz", str2: "xyz" }]) {
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

test("the python first example prints the expected answer", async () => {
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = "/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/bespoke-1/1153";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "solution.py");
  writeFileSync(file, python + "\n");
  const output = execFileSync("python3", ["-I", file], { input: JSON.stringify({ str1: "abcd", str2: "bcda" }), encoding: "utf8" });
  assert.equal(JSON.parse(output), true);
});
