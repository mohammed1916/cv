import test from "node:test";
import assert from "node:assert/strict";
import { CODE, parseGasCostInput, buildGasStationStory } from "./algorithm.js";

test("CODE export matches Python solution definition", () => {
  assert.ok(Array.isArray(CODE), "CODE must be an array");
  assert.equal(CODE.length, 10, "CODE must have 10 lines");
  assert.equal(CODE[0], "def canCompleteCircuit(gas, cost):");
  assert.ok(CODE[1].includes("if sum(gas) < sum(cost): return -1"));
  assert.ok(CODE[2].includes("total_tank, curr_tank, start_station = 0, 0, 0"));
  assert.ok(CODE[9].includes("return start_station if total_tank >= 0 else -1"));
});

test("parseGasCostInput strictly validates input formats and types", () => {
  // Valid array inputs
  const parsed1 = parseGasCostInput([1, 2, 3], [3, 2, 1]);
  assert.deepEqual(parsed1, { gas: [1, 2, 3], cost: [3, 2, 1] });

  // Valid JSON string inputs
  const parsed2 = parseGasCostInput("[1, 2, 3]", "[3, 2, 1]");
  assert.deepEqual(parsed2, { gas: [1, 2, 3], cost: [3, 2, 1] });

  // Valid single object input
  const parsed3 = parseGasCostInput({ gas: [4, 5], cost: [1, 2] });
  assert.deepEqual(parsed3, { gas: [4, 5], cost: [1, 2] });

  // Valid 2D array input
  const parsed4 = parseGasCostInput([[4, 5], [1, 2]]);
  assert.deepEqual(parsed4, { gas: [4, 5], cost: [1, 2] });

  // Valid JSON string representing object
  const parsed5 = parseGasCostInput(JSON.stringify({ gas: [1], cost: [1] }));
  assert.deepEqual(parsed5, { gas: [1], cost: [1] });

  // Invalid: null / undefined
  assert.throws(() => parseGasCostInput(null), /Input cannot be null or undefined/);
  assert.throws(() => parseGasCostInput(undefined), /Input cannot be null or undefined/);
  assert.throws(() => parseGasCostInput([1], null), /gas and cost inputs cannot be null or undefined/);

  // Invalid: empty string
  assert.throws(() => parseGasCostInput("  "), /Input string cannot be empty/);

  // Invalid: empty arrays
  assert.throws(() => parseGasCostInput([], []), /gas and cost arrays cannot be empty/);
  assert.throws(() => parseGasCostInput("[]", "[]"), /gas and cost arrays cannot be empty/);

  // Invalid: mismatched length
  assert.throws(() => parseGasCostInput([1, 2], [1]), /gas and cost must have the same length/);

  // Invalid: negative numbers
  assert.throws(() => parseGasCostInput([-1, 2], [1, 2]), /must be a non-negative integer/);
  assert.throws(() => parseGasCostInput([1, 2], [1, -2]), /must be a non-negative integer/);

  // Invalid: floats / non-integers
  assert.throws(() => parseGasCostInput([1.5, 2], [1, 2]), /must be a non-negative integer/);
  assert.throws(() => parseGasCostInput([1, 2], [1, 2.5]), /must be a non-negative integer/);

  // Invalid: non-numbers / strings inside array
  assert.throws(() => parseGasCostInput(["1", 2], [1, 2]), /must be a non-negative integer/);
  assert.throws(() => parseGasCostInput([1, 2], [NaN, 2]), /must be a non-negative integer/);
});

test("Example 1: gas=[1,2,3,4,5], cost=[3,4,5,1,2] finds starting station 3", () => {
  const story = buildGasStationStory([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);

  assert.equal(story.startStation, 3, "Winning start station should be 3");
  assert.equal(story.canComplete, true, "Circuit should be feasible");
  assert.equal(story.totalGas, 15);
  assert.equal(story.totalCost, 15);
  assert.deepEqual(story.net, [-2, -2, -2, 3, 3]);

  // Frames assertions
  assert.ok(story.frames.length > 10, "Should generate detailed execution trace frames");

  // Check candidate resets occurred at stations 0, 1, 2
  const resetFrames = story.frames.filter((f) => f.event === "reset-candidate");
  assert.equal(resetFrames.length, 3, "Should have 3 candidate reset events");
  assert.equal(resetFrames[0].candidateStart, 1);
  assert.equal(resetFrames[1].candidateStart, 2);
  assert.equal(resetFrames[2].candidateStart, 3);

  // Verify final frame returns 3 on line 10
  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.activeLine, 10);
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.candidateStart, 3);
  assert.equal(lastFrame.event, "success");
  assert.ok(lastFrame.explanation.includes("start_station = 3"));
});

test("Example 2: gas=[2,3,4], cost=[3,4,3] returns -1 (impossible circuit)", () => {
  // Default early check mode: exits on line 2 because sum(gas) 9 < sum(cost) 10
  const storyEarly = buildGasStationStory([2, 3, 4], [3, 4, 3]);

  assert.equal(storyEarly.startStation, -1);
  assert.equal(storyEarly.canComplete, false);
  assert.equal(storyEarly.totalGas, 9);
  assert.equal(storyEarly.totalCost, 10);
  assert.deepEqual(storyEarly.net, [-1, -1, 1]);

  const lastEarlyFrame = storyEarly.frames[storyEarly.frames.length - 1];
  assert.equal(lastEarlyFrame.activeLine, 2);
  assert.equal(lastEarlyFrame.event, "impossible");
  assert.equal(lastEarlyFrame.phase, "deficit");

  // Simulation mode (skipEarlyCheck: true): runs through greedy scan and verifies at line 10
  const storySim = buildGasStationStory([2, 3, 4], [3, 4, 3], { skipEarlyCheck: true });
  assert.equal(storySim.startStation, -1);
  assert.equal(storySim.canComplete, false);

  const lastSimFrame = storySim.frames[storySim.frames.length - 1];
  assert.equal(lastSimFrame.activeLine, 10);
  assert.equal(lastSimFrame.phase, "done");
  assert.equal(lastSimFrame.event, "failure");
  assert.ok(lastSimFrame.totalTank < 0);
});

test("Single station: gas=[2], cost=[2] returns start station 0", () => {
  const story = buildGasStationStory([2], [2]);

  assert.equal(story.startStation, 0);
  assert.equal(story.canComplete, true);
  assert.equal(story.totalGas, 2);
  assert.equal(story.totalCost, 2);
  assert.deepEqual(story.net, [0]);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.activeLine, 10);
  assert.equal(lastFrame.candidateStart, 0);
  assert.equal(lastFrame.event, "success");
});

test("Single station deficit: gas=[1], cost=[2] returns -1", () => {
  const story = buildGasStationStory([1], [2]);

  assert.equal(story.startStation, -1);
  assert.equal(story.canComplete, false);
});

test("Exact fuel with start at station 0: gas=[3,1,1], cost=[1,2,2]", () => {
  const story = buildGasStationStory([3, 1, 1], [1, 2, 2]);

  assert.equal(story.startStation, 0);
  assert.equal(story.canComplete, true);
  assert.equal(story.totalGas, 5);
  assert.equal(story.totalCost, 5);
});

test("Trace frames maintain immutable state snapshots", () => {
  const story = buildGasStationStory([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);

  // Check each frame has required fields
  for (let i = 0; i < story.frames.length; i++) {
    const frame = story.frames[i];
    assert.ok(typeof frame.activeLine === "number", `frame ${i} activeLine must be a number`);
    assert.ok(typeof frame.phase === "string", `frame ${i} phase must be a string`);
    assert.ok(typeof frame.explanation === "string", `frame ${i} explanation must be a string`);
    assert.ok(typeof frame.message === "string", `frame ${i} message must be a string`);
    assert.ok(Array.isArray(frame.stationStates), `frame ${i} stationStates must be an array`);
    assert.equal(frame.stationStates.length, 5, `frame ${i} stationStates length must match n`);
  }

  // Check that stationStates arrays in distinct frames are not the same reference
  const f0States = story.frames[0].stationStates;
  const fLastStates = story.frames[story.frames.length - 1].stationStates;
  assert.notEqual(f0States, fLastStates, "stationStates must be freshly snapshot per frame");
});
