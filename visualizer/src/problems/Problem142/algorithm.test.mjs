import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseCycle2Input,
  buildCycle2Story,
} from "./algorithm.js";

test("CODE matches the canonical Python detectCycle reference implementation", () => {
  assert.ok(Array.isArray(CODE));
  assert.equal(CODE.length, 15);
  assert.match(CODE[0], /def detectCycle\(head\):/);
  assert.match(CODE[1], /slow = fast = head/);
  assert.match(CODE[2], /while fast and fast\.next:/);
  assert.match(CODE[3], /slow = slow\.next/);
  assert.match(CODE[4], /fast = fast\.next\.next/);
  assert.match(CODE[5], /if slow == fast:/);
  assert.match(CODE[6], /break/);
  assert.match(CODE[7], /else:/);
  assert.match(CODE[8], /return None/);
  assert.match(CODE[9], /ptr1 = head/);
  assert.match(CODE[10], /ptr2 = slow/);
  assert.match(CODE[11], /while ptr1 != ptr2:/);
  assert.match(CODE[12], /ptr1 = ptr1\.next/);
  assert.match(CODE[13], /ptr2 = ptr2\.next/);
  assert.match(CODE[14], /return ptr1/);
});

test("parseCycle2Input parses valid array and pos inputs in multiple formats", () => {
  // Two direct arguments
  const res1 = parseCycle2Input([3, 2, 0, -4], 1);
  assert.deepEqual(res1.values, [3, 2, 0, -4]);
  assert.equal(res1.pos, 1);

  // Stringified JSON array and string pos
  const res2 = parseCycle2Input("[1, 2]", "0");
  assert.deepEqual(res2.values, [1, 2]);
  assert.equal(res2.pos, 0);

  // Comma-separated values and negative pos (-1 = no cycle)
  const res3 = parseCycle2Input("1, 2, 3", -1);
  assert.deepEqual(res3.values, [1, 2, 3]);
  assert.equal(res3.pos, -1);

  // Object with { values, pos }
  const res4 = parseCycle2Input({ values: [10, 20, 30], pos: 2 });
  assert.deepEqual(res4.values, [10, 20, 30]);
  assert.equal(res4.pos, 2);

  // Object with { nodes, pos }
  const res5 = parseCycle2Input({ nodes: [5], pos: -1 });
  assert.deepEqual(res5.values, [5]);
  assert.equal(res5.pos, -1);

  // Single JSON object string
  const res6 = parseCycle2Input('{"values": [1, 2], "pos": 0}');
  assert.deepEqual(res6.values, [1, 2]);
  assert.equal(res6.pos, 0);

  // Delimited string format
  const res7 = parseCycle2Input("[3, 2, 0, -4], pos = 1");
  assert.deepEqual(res7.values, [3, 2, 0, -4]);
  assert.equal(res7.pos, 1);

  // Empty array with pos = -1
  const res8 = parseCycle2Input([], -1);
  assert.deepEqual(res8.values, []);
  assert.equal(res8.pos, -1);
});

test("parseCycle2Input strictly rejects invalid inputs", () => {
  // Missing values
  assert.throws(() => parseCycle2Input(null, 0), /Values array is required/);
  assert.throws(() => parseCycle2Input(undefined, 0), /Values array is required/);
  assert.throws(() => parseCycle2Input("", 0), /Values array cannot be empty string/);

  // Invalid JSON formatting
  assert.throws(() => parseCycle2Input("[1, 2", 0), /Invalid JSON array format/);
  assert.throws(() => parseCycle2Input("{ invalid json }"), /Invalid JSON format/);

  // Non-integer values
  assert.throws(() => parseCycle2Input([1, "two", 3], 0), /Value at index 1 must be an integer/);
  assert.throws(() => parseCycle2Input([1, 2.5, 3], 0), /Value at index 1 must be an integer/);
  assert.throws(() => parseCycle2Input([1, null, 3], 0), /Value at index 1 must be an integer/);

  // Missing or invalid pos
  assert.throws(() => parseCycle2Input([1, 2], undefined), /Cycle pos is required/);
  assert.throws(() => parseCycle2Input([1, 2], "abc"), /pos must be an integer/);
  assert.throws(() => parseCycle2Input([1, 2], 1.5), /pos must be an integer/);

  // Out of bounds pos
  assert.throws(() => parseCycle2Input([1, 2], -2), /pos must be between -1 and 1/);
  assert.throws(() => parseCycle2Input([1, 2], 2), /pos must be between -1 and 1/);
  assert.throws(() => parseCycle2Input([1, 2], 10), /pos must be between -1 and 1/);

  // Empty list with pos != -1
  assert.throws(() => parseCycle2Input([], 0), /pos must be -1 when values array is empty/);
});

test("buildCycle2Story for [3, 2, 0, -4] with pos = 1 finds cycle entrance at index 1", () => {
  const story = buildCycle2Story([3, 2, 0, -4], 1);
  assert.equal(story.pos, 1);
  assert.equal(story.nodes.length, 4);
  assert.equal(story.cycleNode.id, 1);
  assert.equal(story.cycleNode.val, 2);

  // Check frames
  const frames = story.frames;
  assert.ok(frames.length > 5);

  // Check meeting frame in Phase 1
  const meetFrame = frames.find((f) => f.phase === "phase1" && f.isMeeting);
  assert.ok(meetFrame, "Must have a meeting frame in Phase 1");
  assert.equal(meetFrame.slow, 3);
  assert.equal(meetFrame.fast, 3);
  assert.equal(meetFrame.meetingPoint, 3);

  // Check Phase 2 initialization
  const p2InitFrame = frames.find((f) => f.activeLine === 10);
  assert.ok(p2InitFrame);
  assert.equal(p2InitFrame.ptr1, 0);
  assert.equal(p2InitFrame.meetingPoint, 3);

  const p2Ptr2Frame = frames.find((f) => f.activeLine === 11);
  assert.ok(p2Ptr2Frame);
  assert.equal(p2Ptr2Frame.ptr1, 0);
  assert.equal(p2Ptr2Frame.ptr2, 3);

  // Check mathematical invariant
  assert.ok(p2Ptr2Frame.mathInvariant);
  assert.equal(p2Ptr2Frame.mathInvariant.F, 1); // straight distance
  assert.equal(p2Ptr2Frame.mathInvariant.C, 3); // cycle length (nodes 1, 2, 3)
  assert.equal(p2Ptr2Frame.mathInvariant.a, 2); // distance from entrance (1) to meet (3) is 2 (1->2->3)
  // Check formula F = nC - a => 1 = 1*3 - 2 = 1
  assert.equal(
    p2Ptr2Frame.mathInvariant.F,
    p2Ptr2Frame.mathInvariant.laps * p2Ptr2Frame.mathInvariant.C - p2Ptr2Frame.mathInvariant.a
  );

  // Final frame
  const finalFrame = frames[frames.length - 1];
  assert.equal(finalFrame.phase, "done");
  assert.equal(finalFrame.activeLine, 15);
  assert.equal(finalFrame.result, 1);
  assert.equal(finalFrame.cycleEntrance, 1);
  assert.equal(finalFrame.phase2Steps, 1); // Took exactly F = 1 step
});

test("buildCycle2Story for [1, 2] with pos = 0 finds cycle entrance at index 0", () => {
  const story = buildCycle2Story([1, 2], 0);
  assert.equal(story.pos, 0);
  assert.equal(story.cycleNode.id, 0);
  assert.equal(story.cycleNode.val, 1);

  const frames = story.frames;
  // Slow and fast meet at node 0
  const meetFrame = frames.find((f) => f.phase === "phase1" && f.isMeeting);
  assert.ok(meetFrame);
  assert.equal(meetFrame.slow, 0);
  assert.equal(meetFrame.fast, 0);

  // In Phase 2, ptr1 and ptr2 both start at 0, so 0 steps in loop body
  const finalFrame = frames[frames.length - 1];
  assert.equal(finalFrame.phase, "done");
  assert.equal(finalFrame.activeLine, 15);
  assert.equal(finalFrame.result, 0);
  assert.equal(finalFrame.cycleEntrance, 0);
  assert.equal(finalFrame.phase2Steps, 0); // F = 0
});

test("buildCycle2Story for [1] with pos = -1 detects no cycle and returns None", () => {
  const story = buildCycle2Story([1], -1);
  assert.equal(story.pos, -1);
  assert.equal(story.cycleNode, null);

  const frames = story.frames;
  const finalFrame = frames[frames.length - 1];
  assert.equal(finalFrame.phase, "done");
  assert.equal(finalFrame.activeLine, 9);
  assert.equal(finalFrame.result, null);
  assert.match(finalFrame.message, /return None/);
});

test("buildCycle2Story for empty list [] with pos = -1 returns None", () => {
  const story = buildCycle2Story([], -1);
  assert.equal(story.pos, -1);
  assert.equal(story.nodes.length, 0);
  assert.equal(story.cycleNode, null);

  const frames = story.frames;
  const finalFrame = frames[frames.length - 1];
  assert.equal(finalFrame.phase, "done");
  assert.equal(finalFrame.activeLine, 9);
  assert.equal(finalFrame.result, null);
});

test("buildCycle2Story for multiple loop lengths and topologies", () => {
  // 1. Pure cycle of length 3: [10, 20, 30], pos = 0
  const pureCycle = buildCycle2Story([10, 20, 30], 0);
  assert.equal(pureCycle.frames[pureCycle.frames.length - 1].result, 0);

  // 2. Self loop on single node: [42], pos = 0
  const selfLoop = buildCycle2Story([42], 0);
  const selfFinal = selfLoop.frames[selfLoop.frames.length - 1];
  assert.equal(selfFinal.result, 0);

  // 3. Long tail of 4 nodes leading to loop of length 3: [1, 2, 3, 4, 5, 6, 7], pos = 4
  // Nodes: 0, 1, 2, 3 (F = 4), cycle: 4, 5, 6 (C = 3)
  const longTail = buildCycle2Story([1, 2, 3, 4, 5, 6, 7], 4);
  const longFinal = longTail.frames[longTail.frames.length - 1];
  assert.equal(longFinal.result, 4);
  assert.equal(longFinal.phase2Steps, 4); // Must take exactly F = 4 steps!

  // 4. Large loop with small tail: [1, 2, 3, 4, 5, 6, 7, 8], pos = 1 (F = 1, C = 7)
  const largeLoop = buildCycle2Story([1, 2, 3, 4, 5, 6, 7, 8], 1);
  const largeFinal = largeLoop.frames[largeLoop.frames.length - 1];
  assert.equal(largeFinal.result, 1);
  assert.equal(largeFinal.phase2Steps, 1);

  // 5. Multi-node linear list without cycle: [1, 2, 3, 4, 5], pos = -1
  const linearList = buildCycle2Story([1, 2, 3, 4, 5], -1);
  const linearFinal = linearList.frames[linearList.frames.length - 1];
  assert.equal(linearFinal.result, null);
  assert.equal(linearFinal.activeLine, 9);
});

test("trace frames are strictly frozen and immutable with valid activeLine and metadata", () => {
  const story = buildCycle2Story([3, 2, 0, -4], 1);
  assert.ok(Object.isFrozen(story.frames));

  for (const frame of story.frames) {
    assert.ok(Object.isFrozen(frame));
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 15);
    assert.ok(["init", "phase1", "phase2", "done"].includes(frame.phase));
    assert.ok(typeof frame.message === "string" && frame.message.length > 0);
    assert.ok(typeof frame.explanation === "string" && frame.explanation.length > 0);
  }
});
