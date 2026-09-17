import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseLinkedListCycleInput,
  buildCycleStory,
} from "./algorithm.js";

test("CODE matches Floyd's Tortoise and Hare implementation", () => {
  assert.equal(CODE.length, 8);
  assert.equal(CODE[0], "def hasCycle(head):");
  assert.equal(CODE[1], "    slow = fast = head");
  assert.equal(CODE[2], "    while fast and fast.next:");
  assert.equal(CODE[3], "        slow = slow.next");
  assert.equal(CODE[4], "        fast = fast.next.next");
  assert.equal(CODE[5], "        if slow == fast:");
  assert.equal(CODE[6], "            return True");
  assert.equal(CODE[7], "    return False");
});

test("parseLinkedListCycleInput validates two arguments correctly", () => {
  const res1 = parseLinkedListCycleInput([3, 2, 0, -4], 1);
  assert.deepEqual(res1, { values: [3, 2, 0, -4], pos: 1 });

  const res2 = parseLinkedListCycleInput([1, 2], 0);
  assert.deepEqual(res2, { values: [1, 2], pos: 0 });

  const res3 = parseLinkedListCycleInput([1], -1);
  assert.deepEqual(res3, { values: [1], pos: -1 });

  const res4 = parseLinkedListCycleInput([], -1);
  assert.deepEqual(res4, { values: [], pos: -1 });
});

test("parseLinkedListCycleInput parses single formatted string or object", () => {
  // Delimiter pipe format
  const r1 = parseLinkedListCycleInput("[3, 2, 0, -4] | pos = 1");
  assert.deepEqual(r1, { values: [3, 2, 0, -4], pos: 1 });

  // Comma pos format
  const r2 = parseLinkedListCycleInput("[3, 2, 0, -4], pos = 1");
  assert.deepEqual(r2, { values: [3, 2, 0, -4], pos: 1 });

  // Comma integer format
  const r3 = parseLinkedListCycleInput("[1, 2], 0");
  assert.deepEqual(r3, { values: [1, 2], pos: 0 });

  // JSON string
  const r4 = parseLinkedListCycleInput('{"values": [1, 2], "pos": 0}');
  assert.deepEqual(r4, { values: [1, 2], pos: 0 });

  // Plain array string (pos defaults to -1)
  const r5 = parseLinkedListCycleInput("[1, 2, 3]");
  assert.deepEqual(r5, { values: [1, 2, 3], pos: -1 });

  // Object input
  const r6 = parseLinkedListCycleInput({ values: [10, 20], pos: 1 });
  assert.deepEqual(r6, { values: [10, 20], pos: 1 });
});

test("parseLinkedListCycleInput rejects invalid inputs strictly", () => {
  // Empty list with pos >= 0
  assert.throws(() => parseLinkedListCycleInput([], 0), /pos must be -1 for an empty list/);

  // Pos out of bounds
  assert.throws(() => parseLinkedListCycleInput([1, 2, 3], 3), /pos out of range/);
  assert.throws(() => parseLinkedListCycleInput([1, 2, 3], -2), /pos out of range/);

  // Pos not an integer
  assert.throws(() => parseLinkedListCycleInput([1, 2], 0.5), /pos must be an integer/);
  assert.throws(() => parseLinkedListCycleInput([1, 2], "not-a-number"), /Invalid pos/);

  // Non-array or malformed values
  assert.throws(() => parseLinkedListCycleInput(null, -1), /Input values cannot be null or undefined/);
  assert.throws(() => parseLinkedListCycleInput(undefined, -1), /Input values cannot be null or undefined/);
  assert.throws(() => parseLinkedListCycleInput("[invalid json]", -1), /Invalid array JSON syntax/);
  assert.throws(() => parseLinkedListCycleInput("invalid string", -1), /Invalid number token/);

  // Non-numeric elements
  assert.throws(() => parseLinkedListCycleInput([1, "x", 3], 0), /not a valid finite number/);
  assert.throws(() => parseLinkedListCycleInput([1, NaN, 3], 0), /not a valid finite number/);
  assert.throws(() => parseLinkedListCycleInput([1, Infinity, 3], 0), /not a valid finite number/);

  // Oversized array
  const bigArr = new Array(501).fill(1);
  assert.throws(() => parseLinkedListCycleInput(bigArr, -1), /Linked list exceeds maximum length/);
});

test("buildCycleStory: [3, 2, 0, -4] with pos=1 detects cycle and returns True", () => {
  const story = buildCycleStory([3, 2, 0, -4], 1);
  assert.equal(story.hasCycle, true);
  assert.equal(story.pos, 1);
  assert.equal(story.nodes.length, 4);
  assert.equal(story.nodes[3].next, 1);

  const frames = story.frames;
  assert.ok(frames.length > 0);

  // Frame 1 is init
  assert.equal(frames[0].activeLine, 2);
  assert.equal(frames[0].phase, "init");
  assert.equal(frames[0].slow, 0);
  assert.equal(frames[0].fast, 0);

  // Final frame is done with result true
  const lastFrame = frames[frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 7);
  assert.equal(lastFrame.result, true);
  assert.equal(lastFrame.meetingNode, 3);
});

test("buildCycleStory: [1, 2] with pos=0 detects cycle and returns True", () => {
  const story = buildCycleStory([1, 2], 0);
  assert.equal(story.hasCycle, true);
  assert.equal(story.pos, 0);
  assert.equal(story.nodes[1].next, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 7);
  assert.equal(lastFrame.result, true);
  assert.equal(lastFrame.meetingNode, 0);
});

test("buildCycleStory: [1] with pos=-1 terminates without cycle and returns False", () => {
  const story = buildCycleStory([1], -1);
  assert.equal(story.hasCycle, false);
  assert.equal(story.pos, -1);
  assert.equal(story.nodes[0].next, null);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 8);
  assert.equal(lastFrame.result, false);
});

test("buildCycleStory: empty list [] with pos=-1 returns False immediately", () => {
  const story = buildCycleStory([], -1);
  assert.equal(story.hasCycle, false);
  assert.equal(story.pos, -1);
  assert.equal(story.nodes.length, 0);
  assert.equal(story.frames.length, 3);

  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[1].phase, "check");
  assert.equal(story.frames[2].phase, "done");
  assert.equal(story.frames[2].activeLine, 8);
  assert.equal(story.frames[2].result, false);
});

test("buildCycleStory: single node loop [1] with pos=0 detects cycle", () => {
  const story = buildCycleStory([1], 0);
  assert.equal(story.hasCycle, true);
  assert.equal(story.nodes[0].next, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.result, true);
  assert.equal(lastFrame.meetingNode, 0);
});

test("buildCycleStory: [1, 2, 3, 4, 5] without cycle (pos=-1) fast reaches null", () => {
  const story = buildCycleStory([1, 2, 3, 4, 5], -1);
  assert.equal(story.hasCycle, false);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 8);
  assert.equal(lastFrame.result, false);
});

test("buildCycleStory: duplicate values and negatives/zeros handle correctly", () => {
  // Duplicates
  const storyDup = buildCycleStory([2, 2, 2, 2], 2);
  assert.equal(storyDup.hasCycle, true);
  const lastDup = storyDup.frames[storyDup.frames.length - 1];
  assert.equal(lastDup.result, true);

  // Negatives & zero
  const storyNeg = buildCycleStory([-5, 0, -10, 0, 5], 0);
  assert.equal(storyNeg.hasCycle, true);
  const lastNeg = storyNeg.frames[storyNeg.frames.length - 1];
  assert.equal(lastNeg.result, true);
});

test("buildCycleStory: frames maintain strict immutability and complete properties", () => {
  const story = buildCycleStory([3, 2, 0, -4], 1);
  const validPhases = new Set(["init", "check", "move_slow", "move_fast", "compare", "done"]);

  for (let i = 0; i < story.frames.length; i++) {
    const frame = story.frames[i];
    assert.ok(typeof frame.activeLine === "number", `frame ${i} has activeLine`);
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 8, `frame ${i} line in 1..8`);
    assert.ok(validPhases.has(frame.phase), `frame ${i} valid phase`);
    assert.ok(typeof frame.message === "string" && frame.message.length > 0);
    assert.ok(typeof frame.explanation === "string" && frame.explanation.length > 0);
  }
});
