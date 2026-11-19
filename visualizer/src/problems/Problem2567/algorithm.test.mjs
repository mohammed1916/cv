import test from "node:test";
import assert from "node:assert/strict";
import { code, python, trackerCode, trackerPython, phases, trackerPhases, parseInput, buildTrace, buildTrackerTrace } from "./algorithm.js";

// Brute force: try every pair of positions to change; the rest keep their values.
function brute(nums) {
  let best = Infinity;
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) {
    const rest = nums.filter((_, k) => k !== i && k !== j);
    best = Math.min(best, Math.max(...rest) - Math.min(...rest));
  }
  return best;
}

function lcg(seed) { let x = seed; return () => (x = (x * 1103515245 + 12345) % 2147483648); }

test("both solutions agree with brute force on random arrays", () => {
  const next = lcg(7);
  for (let t = 0; t < 400; t++) {
    const n = 3 + (next() % 8);
    const nums = Array.from({ length: n }, () => (next() % 41) - 20);
    const expected = brute(nums);
    assert.equal(buildTrace({ nums }).result, expected, JSON.stringify(nums));
    assert.equal(buildTrackerTrace({ nums }).result, expected, JSON.stringify(nums));
  }
});

test("all-negative values are handled by the tracker (regression for a 0 initial maximum)", () => {
  assert.equal(buildTrackerTrace({ nums: [-5, -4, -3] }).result, 0);
  assert.equal(buildTrace({ nums: [-5, -4, -3] }).result, 0);
});

test("the statement example [1,4,7,8,5] gives 3", () => {
  assert.equal(buildTrace({ nums: [1, 4, 7, 8, 5] }).result, 3);
  assert.equal(buildTrackerTrace({ nums: [1, 4, 7, 8, 5] }).result, 3);
});

test("every frame points at a real JS line and Python line", () => {
  const jsLines = new Set(code.map(entry => entry.line).concat(trackerCode.map(entry => entry.line)));
  const pyCount = python.split("\n").length;
  const trackerPyCount = trackerPython.split("\n").length;
  for (const trace of [buildTrace({ nums: [3, 1, 4, 1, 5] }), buildTrackerTrace({ nums: [3, 1, 4, 1, 5] })]) {
    const pyTotal = trace.approach === "tracker" ? trackerPyCount : pyCount;
    const ids = new Set((trace.approach === "tracker" ? trackerPhases : phases).map(p => p.id));
    for (const f of trace.frames) {
      assert.ok(ids.has(f.phase), f.phase);
      assert.ok(jsLines.has(f.activeLine), `js ${f.activeLine}`);
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyTotal, `py ${f.pythonLine}`);
    }
    assert.equal(trace.frames.at(-1).phase, "done");
  }
});

test("parser enforces the visualization cap and integer values", () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'));
  assert.throws(() => parseInput('{"nums":[1.5,2,3]}'));
  assert.throws(() => parseInput(JSON.stringify({ nums: Array.from({ length: 41 }, (_, i) => i) })));
  assert.deepEqual(parseInput('{"nums":[1,2,3]}').nums, [1, 2, 3]);
});
