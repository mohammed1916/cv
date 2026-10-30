import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeDiagram from "../../components/shared/TreeDiagram";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3372",
  phases: [
    { id: "setup", label: "Setup", description: "Build both adjacency lists." },
    { id: "bridge", label: "Bridge", description: "Find the best tree-2 start for the connecting edge." },
    { id: "count", label: "Count", description: "Count reachable nodes for each tree-1 node." },
    { id: "done", label: "Result", description: "Return every total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"edges1": [[0,1]], "edges2": [[0,1]], "k": 1}',
  url: "https://leetcode.com/problems/maximize-the-number-of-target-nodes-after-connecting-trees-i/",
  complexity: "O(n * (n + m) + m * (n + m)) time for tree sizes n and m. The visualization accepts at most 40 nodes per tree.",
  examples: [
    { label: "Sourced example (k = 1)", input: '{"edges1": [[0,1],[0,2],[0,3],[0,4]], "edges2": [[0,1],[1,2],[2,3]], "k": 1}' },
    { label: "Illustrative: k = 0", input: '{"edges1": [[0,1],[1,2]], "edges2": [[0,1]], "k": 0}' },
  ],
};

// Lay the tree out by BFS depth from node 0 so every node has a stable position.
function layout(edges) {
  const n = edges.length + 1;
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const depth = new Array(n).fill(-1);
  depth[0] = 0;
  const queue = [0];
  for (let head = 0; head < queue.length; head += 1) {
    const node = queue[head];
    for (const next of adj[node]) {
      if (depth[next] < 0) { depth[next] = depth[node] + 1; queue.push(next); }
    }
  }
  const seenPerLevel = {};
  const positions = new Map();
  queue.forEach(id => {
    const level = depth[id];
    seenPerLevel[level] = (seenPerLevel[level] || 0) + 1;
    positions.set(id, { x: 48 + (seenPerLevel[level] - 1) * 64, y: 48 + level * 76 });
  });
  return positions;
}

export default function Problem3372Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const edges = run.input.edges1;
        const positions = layout(edges);
        const nodes = [...positions.keys()].map(id => ({ id, val: id }));
        const edgeList = edges.map(([a, b]) => ({ fromId: a, toId: b }));
        const reachSet = new Set(step.reach);
        return (
          <>
            <p>Tree 1 with k = {run.input.k}. Highlighted nodes are within reach of the current node.</p>
            <TreeDiagram positions={positions} edges={edgeList} nodes={nodes}
              activeIds={new Set(step.current !== null && step.tree === "first" ? [step.current] : [])}
              visitedIds={reachSet}
              labelForNode={node => (step.counts[node.id] !== undefined ? `total ${step.counts[node.id]}` : "")} />
            {step.tree === "second" && <p>Working on tree 2: node {step.current} gives reach {step.reach.length}.</p>}
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
