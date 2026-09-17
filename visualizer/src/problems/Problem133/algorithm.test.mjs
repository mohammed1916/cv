import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseAdjListInput,
  buildCloneGraphStory,
  getOriginalAddress,
  getCloneAddress,
} from "./algorithm.js";

test("CODE matches the canonical BFS cloneGraph reference implementation", () => {
  assert.ok(Array.isArray(CODE));
  assert.equal(CODE.length, 13);
  assert.equal(CODE[0], "def cloneGraph(node):");
  assert.equal(CODE[1], "    if not node: return None");
  assert.equal(CODE[2], "    clones = {}");
  assert.equal(CODE[3], "    queue = deque([node])");
  assert.equal(CODE[4], "    clones[node.val] = Node(node.val)");
  assert.equal(CODE[5], "    while queue:");
  assert.equal(CODE[6], "        curr = queue.popleft()");
  assert.equal(CODE[7], "        for neighbor in curr.neighbors:");
  assert.equal(CODE[8], "            if neighbor.val not in clones:");
  assert.equal(CODE[9], "                clones[neighbor.val] = Node(neighbor.val)");
  assert.equal(CODE[10], "                queue.append(neighbor)");
  assert.equal(CODE[11], "            clones[curr.val].neighbors.append(clones[neighbor.val])");
  assert.equal(CODE[12], "    return clones[node.val]");
});

test("parseAdjListInput parses valid graphs: cycle, single, empty, 2-node, string & array forms", () => {
  // 4-node cycle
  const cycle = "[[2,4],[1,3],[2,4],[1,3]]";
  assert.deepEqual(parseAdjListInput(cycle), [[2, 4], [1, 3], [2, 4], [1, 3]]);

  // Single node with 0 edges
  assert.deepEqual(parseAdjListInput("[[]]"), [[]]);
  assert.deepEqual(parseAdjListInput([[]]), [[]]);

  // Empty graph
  assert.deepEqual(parseAdjListInput("[]"), []);
  assert.deepEqual(parseAdjListInput([]), []);

  // 2 connected nodes
  assert.deepEqual(parseAdjListInput("[[2],[1]]"), [[2], [1]]);
  assert.deepEqual(parseAdjListInput([[2], [1]]), [[2], [1]]);

  // Python single quote style string
  assert.deepEqual(parseAdjListInput("[[2], [1]]"), [[2], [1]]);
});

test("parseAdjListInput rejects invalid inputs strictly without fallback defaults", () => {
  // Empty, null, undefined
  assert.throws(() => parseAdjListInput(null), /Input cannot be empty/);
  assert.throws(() => parseAdjListInput(undefined), /Input cannot be empty/);
  assert.throws(() => parseAdjListInput(""), /Input cannot be empty/);
  assert.throws(() => parseAdjListInput("   "), /Input cannot be empty/);

  // Non-array inputs
  assert.throws(() => parseAdjListInput("{}"), /Adjacency list must be an array/);
  assert.throws(() => parseAdjListInput("123"), /Adjacency list must be an array/);
  assert.throws(() => parseAdjListInput("invalid json"), /Invalid JSON format/);

  // Row not an array
  assert.throws(() => parseAdjListInput([1, 2]), /Node 1 neighbors must be an array/);

  // Self loop
  assert.throws(() => parseAdjListInput([[1]]), /self-loop/);
  assert.throws(() => parseAdjListInput([[2, 1], [1]]), /self-loop/);

  // Out of bounds neighbors
  assert.throws(() => parseAdjListInput([[0]]), /out of bounds/);
  assert.throws(() => parseAdjListInput([[-1]]), /out of bounds/);
  assert.throws(() => parseAdjListInput([[2], [3]]), /out of bounds/); // 3 > N=2

  // Non-integer values
  assert.throws(() => parseAdjListInput([[1.5]]), /must be integers/);
  assert.throws(() => parseAdjListInput([["2"]]), /must be integers/);

  // Duplicate neighbor entries in a single node
  assert.throws(() => parseAdjListInput([[2, 2], [1, 1]]), /duplicate neighbor entry/);

  // Missing reciprocal edge (directed graph)
  assert.throws(() => parseAdjListInput([[2], []]), /not undirected/);
  assert.throws(() => parseAdjListInput([[2], [3], [1]]), /not undirected/);

  // More than 20 nodes
  const twentyOneNodes = Array.from({ length: 21 }, () => []);
  assert.throws(() => parseAdjListInput(twentyOneNodes), /exceeds 20/);
});

test("buildCloneGraphStory clones 4-node cycle with full side-by-side fidelity", () => {
  const input = "[[2,4],[1,3],[2,4],[1,3]]";
  const story = buildCloneGraphStory(input);

  assert.equal(story.originalGraph.numNodes, 4);
  assert.equal(story.clonedGraph.numNodes, 4);
  assert.equal(story.originalGraph.edges.length, 4);

  // Check unique simulated memory addresses
  const origAddrs = new Set(story.originalGraph.nodes.map((n) => n.address));
  const cloneAddrs = new Set(story.clonedGraph.nodes.map((n) => n.address));
  assert.equal(origAddrs.size, 4);
  assert.equal(cloneAddrs.size, 4);
  // Ensure no overlap between original and clone addresses
  for (const a of origAddrs) {
    assert.ok(!cloneAddrs.has(a));
  }

  // Check frames
  assert.ok(story.frames.length > 20);
  const startFrame = story.frames[0];
  assert.equal(startFrame.phase, "start");
  assert.equal(startFrame.activeLine, 1);

  const doneFrame = story.frames.at(-1);
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.activeLine, 13);
  assert.ok(doneFrame.result);
  assert.equal(doneFrame.result.val, 1);

  // Verify all 4 nodes are cloned with identical adjacency topology
  const clones = doneFrame.clones;
  assert.equal(Object.keys(clones).length, 4);
  assert.deepEqual(clones[1].neighbors, [2, 4]);
  assert.deepEqual(clones[2].neighbors, [1, 3]);
  assert.deepEqual(clones[3].neighbors, [2, 4]);
  assert.deepEqual(clones[4].neighbors, [1, 3]);

  // Verify each node has a unique clone address
  assert.equal(clones[1].address, getCloneAddress(1));
  assert.equal(clones[2].address, getCloneAddress(2));
  assert.equal(clones[3].address, getCloneAddress(3));
  assert.equal(clones[4].address, getCloneAddress(4));
});

test("buildCloneGraphStory handles empty graph [] edge case", () => {
  const story = buildCloneGraphStory("[]");
  assert.equal(story.originalGraph.numNodes, 0);
  assert.equal(story.clonedGraph.numNodes, 0);
  assert.equal(story.frames.length, 3);
  assert.equal(story.frames[0].activeLine, 1);
  assert.equal(story.frames[1].activeLine, 2);
  assert.equal(story.frames[2].activeLine, 2);
  assert.equal(story.frames[2].phase, "done");
  assert.equal(story.frames[2].result, null);
});

test("buildCloneGraphStory handles single node with 0 edges [[]]", () => {
  const story = buildCloneGraphStory("[[]]");
  assert.equal(story.originalGraph.numNodes, 1);
  assert.equal(story.clonedGraph.numNodes, 1);

  const doneFrame = story.frames.at(-1);
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.activeLine, 13);
  assert.equal(Object.keys(doneFrame.clones).length, 1);
  assert.deepEqual(doneFrame.clones[1].neighbors, []);
  assert.equal(doneFrame.result.val, 1);
  assert.equal(doneFrame.result.address, getCloneAddress(1));
});

test("buildCloneGraphStory handles 2 connected nodes [[2], [1]]", () => {
  const story = buildCloneGraphStory("[[2], [1]]");
  assert.equal(story.originalGraph.numNodes, 2);
  assert.equal(story.clonedGraph.numNodes, 2);

  const doneFrame = story.frames.at(-1);
  assert.equal(doneFrame.phase, "done");
  assert.equal(Object.keys(doneFrame.clones).length, 2);
  assert.deepEqual(doneFrame.clones[1].neighbors, [2]);
  assert.deepEqual(doneFrame.clones[2].neighbors, [1]);
});

test("trace frames are strictly immutable and have valid activeLine, phase, and explanations", () => {
  const story = buildCloneGraphStory("[[2,4],[1,3],[2,4],[1,3]]");
  const frames = story.frames;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 13, `Line out of range in frame ${i}`);
    assert.ok(typeof frame.phase === "string" && frame.phase.length > 0);
    assert.ok(typeof frame.explanation === "string" && frame.explanation.length > 0);
    assert.ok(Array.isArray(frame.queue));
    assert.ok(typeof frame.clones === "object" && frame.clones !== null);
  }

  // Test immutability: mutating frame 4 queue and clones does not affect frame 5
  const f4QueueLen = frames[4].queue.length;
  frames[4].queue.push(999);
  assert.equal(frames[5].queue.includes(999), false);
  frames[4].queue.pop(); // restore
  assert.equal(frames[4].queue.length, f4QueueLen);

  if (frames[5].clones[1]) {
    frames[5].clones[1].neighbors.push(9999);
    assert.equal(frames[6].clones[1]?.neighbors.includes(9999), false);
  }
});
