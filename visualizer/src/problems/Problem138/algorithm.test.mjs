import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  LINE_PATTERN_MAP,
  PATTERNS,
  parseListWithRandom,
  buildCopyRandomListStory,
} from "./algorithm.js";

test("CODE matches the canonical 3-pass Python solution", () => {
  assert.equal(CODE.length, 22);
  assert.equal(CODE[0], "def copyRandomList(head):");
  assert.equal(CODE[1], "    if not head: return None");
  assert.equal(CODE[2], "    curr = head");
  assert.equal(CODE[3], "    while curr:");
  assert.equal(CODE[4], "        copy = Node(curr.val)");
  assert.equal(CODE[5], "        copy.next = curr.next");
  assert.equal(CODE[6], "        curr.next = copy");
  assert.equal(CODE[7], "        curr = copy.next");
  assert.equal(CODE[8], "    curr = head");
  assert.equal(CODE[9], "    while curr:");
  assert.equal(CODE[10], "        if curr.random:");
  assert.equal(CODE[11], "            curr.next.random = curr.random.next");
  assert.equal(CODE[12], "        curr = curr.next.next");
  assert.equal(CODE[13], "    curr = head");
  assert.equal(CODE[14], "    copy_head = head.next");
  assert.equal(CODE[15], "    while curr:");
  assert.equal(CODE[16], "        copy = curr.next");
  assert.equal(CODE[17], "        curr.next = copy.next");
  assert.equal(CODE[18], "        if copy.next:");
  assert.equal(CODE[19], "            copy.next = copy.next.next");
  assert.equal(CODE[20], "        curr = curr.next");
  assert.equal(CODE[21], "    return copy_head");
});

test("LINE_PATTERN_MAP and PATTERNS match line ranges and phases", () => {
  assert.deepEqual(PATTERNS, ["init", "interleave", "random", "decouple", "done"]);
  for (let l = 1; l <= 22; l++) {
    assert.ok(LINE_PATTERN_MAP[l], `Missing pattern mapping for line ${l}`);
    assert.ok(PATTERNS.includes(LINE_PATTERN_MAP[l]), `Invalid pattern ${LINE_PATTERN_MAP[l]}`);
  }
  assert.equal(LINE_PATTERN_MAP[1], "init");
  assert.equal(LINE_PATTERN_MAP[5], "interleave");
  assert.equal(LINE_PATTERN_MAP[12], "random");
  assert.equal(LINE_PATTERN_MAP[18], "decouple");
  assert.equal(LINE_PATTERN_MAP[22], "done");
});

test("parseListWithRandom parses standard inputs correctly", () => {
  // Example 1: [[7,null],[13,0],[11,4],[10,2],[1,0]]
  const ex1 = parseListWithRandom([[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]);
  assert.equal(ex1.length, 5);
  assert.deepEqual(ex1.map((n) => n.val), [7, 13, 11, 10, 1]);
  assert.deepEqual(ex1.map((n) => n.random), [null, 0, 4, 2, 0]);
  assert.deepEqual(ex1.map((n) => n.id), [0, 1, 2, 3, 4]);

  // Destructuring test
  const [val0, rand0] = ex1[0];
  assert.equal(val0, 7);
  assert.equal(rand0, null);

  // Example 2: [[1,1],[2,1]]
  const ex2 = parseListWithRandom([[1, 1], [2, 1]]);
  assert.equal(ex2.length, 2);
  assert.deepEqual(ex2.map((n) => [n.val, n.random]), [[1, 1], [2, 1]]);

  // Example 3: [[3,null],[3,0],[3,null]]
  const ex3 = parseListWithRandom([[3, null], [3, 0], [3, null]]);
  assert.equal(ex3.length, 3);
  assert.deepEqual(ex3.map((n) => n.val), [3, 3, 3]);
  assert.deepEqual(ex3.map((n) => n.random), [null, 0, null]);

  // Single node pointing to itself
  const single = parseListWithRandom([[42, 0]]);
  assert.equal(single.length, 1);
  assert.equal(single[0].val, 42);
  assert.equal(single[0].random, 0);

  // Single node with null random
  const singleNull = parseListWithRandom([[99, null]]);
  assert.equal(singleNull.length, 1);
  assert.equal(singleNull[0].random, null);

  // Empty list
  assert.deepEqual(parseListWithRandom([]), []);
  assert.deepEqual(parseListWithRandom("[]"), []);

  // String JSON input with null
  const fromStr = parseListWithRandom("[[7, null], [13, 0]]");
  assert.equal(fromStr.length, 2);
  assert.equal(fromStr[0].val, 7);
  assert.equal(fromStr[1].random, 0);

  // String with Python None
  const fromPython = parseListWithRandom("[[7, None], [13, 0]]");
  assert.equal(fromPython.length, 2);
  assert.equal(fromPython[0].random, null);
  assert.equal(fromPython[1].random, 0);

  // Object wrapper with nodes or input
  const fromObj = parseListWithRandom({ nodes: [[5, null], [10, 0]] });
  assert.equal(fromObj.length, 2);
});

test("parseListWithRandom strictly rejects invalid inputs", () => {
  // Empty or null inputs
  assert.throws(() => parseListWithRandom(null), /Input cannot be empty/);
  assert.throws(() => parseListWithRandom(undefined), /Input cannot be empty/);
  assert.throws(() => parseListWithRandom(""), /Input cannot be empty/);
  assert.throws(() => parseListWithRandom("   "), /Input cannot be empty/);

  // Malformed JSON syntax
  assert.throws(() => parseListWithRandom("not an array"), /Invalid list syntax/);
  assert.throws(() => parseListWithRandom("[[1, null"), /Invalid list syntax/);

  // Not an array
  assert.throws(() => parseListWithRandom(123), /Input must be an array/);
  assert.throws(() => parseListWithRandom(true), /Input must be an array/);
  assert.throws(() => parseListWithRandom({}), /Input object must have a 'nodes'/);

  // List exceeds max 30 nodes
  const largeList = Array.from({ length: 31 }, (_, i) => [i, null]);
  assert.throws(() => parseListWithRandom(largeList), /exceeds maximum limit of 30 nodes/);

  // Invalid pair length
  assert.throws(() => parseListWithRandom([[1]]), /must be a pair/);
  assert.throws(() => parseListWithRandom([[1, 2, 3]]), /must be a pair/);

  // Invalid node value
  assert.throws(() => parseListWithRandom([[1.5, null]]), /val must be an integer/);
  assert.throws(() => parseListWithRandom([["str", null]]), /val must be an integer/);
  assert.throws(() => parseListWithRandom([[10001, null]]), /out of bounds/);
  assert.throws(() => parseListWithRandom([[-10001, null]]), /out of bounds/);

  // Invalid random index
  assert.throws(() => parseListWithRandom([[1, -1]]), /random pointer .* is out of bounds/);
  assert.throws(() => parseListWithRandom([[1, 1]]), /random pointer .* is out of bounds/); // n=1, index 1 out of bounds
  assert.throws(() => parseListWithRandom([[1, 5]]), /random pointer .* is out of bounds/);
  assert.throws(() => parseListWithRandom([[1, 0.5]]), /random pointer .* is out of bounds/);
  assert.throws(() => parseListWithRandom([[1, "0"]]), /random pointer .* is out of bounds/);
});

test("buildCopyRandomListStory handles empty list", () => {
  const { original, frames } = buildCopyRandomListStory([]);
  assert.equal(original.length, 0);
  assert.equal(frames.length, 2);
  assert.equal(frames[0].activeLine, 1);
  assert.equal(frames[1].activeLine, 2);
  assert.equal(frames[1].phase, "done");
  assert.equal(frames[1].totalNodes, 0);
});

test("buildCopyRandomListStory traces 3 distinct phases for Example 1", () => {
  const input = [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]];
  const { original, frames } = buildCopyRandomListStory(input);

  assert.equal(original.length, 5);
  assert.ok(frames.length > 20);

  // Check phase progression
  const phasesEncountered = new Set(frames.map((f) => f.phase));
  assert.ok(phasesEncountered.has("init"), "Missing init phase");
  assert.ok(phasesEncountered.has("interleave"), "Missing interleave phase");
  assert.ok(phasesEncountered.has("random"), "Missing random phase");
  assert.ok(phasesEncountered.has("decouple"), "Missing decouple phase");
  assert.ok(phasesEncountered.has("done"), "Missing done phase");

  // Phase 1: Verify interleaving
  const interleaveFrames = frames.filter((f) => f.phase === "interleave");
  assert.ok(interleaveFrames.length > 0);
  const afterPhase1 = frames.find(
    (f) => f.phase === "interleave" && f.action === "complete_phase1"
  );
  assert.ok(afterPhase1, "Expected complete_phase1 frame");
  // Every original node points to its clone
  for (let i = 0; i < 5; i++) {
    assert.equal(afterPhase1.originalNodes[i].nextKey, `clone-${i}`);
    assert.equal(afterPhase1.clonedNodes[i].created, true);
    if (i < 4) {
      assert.equal(afterPhase1.clonedNodes[i].nextKey, `orig-${i + 1}`);
    } else {
      assert.equal(afterPhase1.clonedNodes[i].nextKey, null);
    }
  }

  // Phase 2: Verify random pointer wiring
  const afterPhase2 = frames.find(
    (f) => f.phase === "random" && f.action === "complete_phase2"
  );
  assert.ok(afterPhase2, "Expected complete_phase2 frame");
  assert.deepEqual(
    afterPhase2.clonedNodes.map((n) => n.random),
    [null, 0, 4, 2, 0]
  );
  assert.equal(afterPhase2.clonedNodes[1].randomKey, "clone-0");
  assert.equal(afterPhase2.clonedNodes[2].randomKey, "clone-4");
  assert.equal(afterPhase2.clonedNodes[3].randomKey, "clone-2");
  assert.equal(afterPhase2.clonedNodes[4].randomKey, "clone-0");

  // Phase 3: Verify decoupling and final state
  const finalFrame = frames[frames.length - 1];
  assert.equal(finalFrame.activeLine, 22);
  assert.equal(finalFrame.phase, "done");
  assert.equal(finalFrame.copyHead, 0);

  // Original list restored: 0 -> 1 -> 2 -> 3 -> 4 -> null
  for (let i = 0; i < 5; i++) {
    const expectedNext = i + 1 < 5 ? `orig-${i + 1}` : null;
    assert.equal(finalFrame.originalNodes[i].nextKey, expectedNext);
    assert.equal(finalFrame.originalNodes[i].random, input[i][1]);
  }

  // Cloned list separated: 0 -> 1 -> 2 -> 3 -> 4 -> null
  for (let i = 0; i < 5; i++) {
    const expectedNext = i + 1 < 5 ? `clone-${i + 1}` : null;
    assert.equal(finalFrame.clonedNodes[i].nextKey, expectedNext);
    assert.equal(finalFrame.clonedNodes[i].val, input[i][0]);
    assert.equal(finalFrame.clonedNodes[i].random, input[i][1]);
  }
});

test("buildCopyRandomListStory correctly copies [[1,1],[2,1]]", () => {
  const { original, frames } = buildCopyRandomListStory([[1, 1], [2, 1]]);
  assert.equal(original.length, 2);

  const finalFrame = frames[frames.length - 1];
  assert.equal(finalFrame.phase, "done");

  // Node 0 clone has random pointing to clone 1
  assert.equal(finalFrame.clonedNodes[0].random, 1);
  assert.equal(finalFrame.clonedNodes[0].randomKey, "clone-1");

  // Node 1 clone has random pointing to clone 1 (self-loop)
  assert.equal(finalFrame.clonedNodes[1].random, 1);
  assert.equal(finalFrame.clonedNodes[1].randomKey, "clone-1");
});

test("buildCopyRandomListStory correctly copies [[3,null],[3,0],[3,null]]", () => {
  const { original, frames } = buildCopyRandomListStory([[3, null], [3, 0], [3, null]]);
  assert.equal(original.length, 3);

  const finalFrame = frames[frames.length - 1];
  assert.equal(finalFrame.phase, "done");
  assert.deepEqual(
    finalFrame.clonedNodes.map((n) => n.val),
    [3, 3, 3]
  );
  assert.deepEqual(
    finalFrame.clonedNodes.map((n) => n.random),
    [null, 0, null]
  );
});

test("frames are immutable across steps", () => {
  const { frames } = buildCopyRandomListStory([[10, 0]]);
  const f0 = frames[0];
  const origLength = f0.originalNodes.length;
  // Attempt to mutate originalNodes of frame 0
  if (f0.originalNodes.length > 0) {
    f0.originalNodes[0].val = 999;
  }
  const fLast = frames[frames.length - 1];
  assert.equal(fLast.originalNodes[0].val, 10);
});
