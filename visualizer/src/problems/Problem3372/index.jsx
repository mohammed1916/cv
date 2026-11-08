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
    { label: "Star and path, k = 1", input: '{"edges1": [[0,1],[0,2],[0,3],[0,4]], "edges2": [[0,1],[1,2],[2,3]], "k": 1}' },
    { label: "Small pair, k = 0", input: '{"edges1": [[0,1],[1,2]], "edges2": [[0,1]], "k": 0}' },
    { label: "Path and fork, k = 2", input: '{"edges1": [[0,1],[1,2],[2,3]], "edges2": [[0,1],[0,2],[2,3]], "k": 2}' },
    { label: 'Two nodes each', input: '{"edges1":[[0,1]],"edges2":[[0,1]],"k":0}' },
    { label: 'Equal trees, k one', input: '{"edges1":[[0,1],[1,2]],"edges2":[[0,1],[1,2]],"k":1}' },
    { label: 'Largest k', input: '{"edges1":[[0,1],[1,2],[2,3]],"edges2":[[0,1]],"k":5}' },
    { label: 'Long run: 40 and 30 nodes', input: '{"edges1":[[0,1],[1,2],[1,3],[1,4],[2,5],[1,6],[1,7],[2,8],[5,9],[6,10],[9,11],[0,12],[10,13],[7,14],[12,15],[12,16],[0,17],[9,18],[5,19],[13,20],[5,21],[10,22],[6,23],[3,24],[12,25],[14,26],[2,27],[3,28],[17,29],[14,30],[1,31],[31,32],[30,33],[20,34],[19,35],[5,36],[4,37],[2,38],[15,39]],"edges2":[[0,1],[1,2],[1,3],[0,4],[0,5],[3,6],[4,7],[0,8],[5,9],[1,10],[7,11],[10,12],[5,13],[8,14],[9,15],[6,16],[0,17],[2,18],[0,19],[4,20],[5,21],[9,22],[8,23],[13,24],[11,25],[14,26],[6,27],[15,28],[5,29]],"k":2}' },
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
            <p>Tree 2 supplies the bridge: the best start node reaches the most nodes within k - 1 steps.</p>
            <TreeDiagram positions={layout(run.input.edges2)} edges={run.input.edges2.map(([a, b]) => ({ fromId: a, toId: b }))}
              nodes={[...layout(run.input.edges2).keys()].map(id => ({ id, val: id }))}
              activeIds={new Set(step.current !== null && step.tree === "second" ? [step.current] : [])}
              visitedIds={new Set(step.tree === "second" ? step.reach : [])}
              labelForNode={node => (step.tree === "second" && node.id === step.current ? `bridge ${step.bridge}` : "")} />
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
