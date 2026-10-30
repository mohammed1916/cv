import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeDiagram from "../../components/shared/TreeDiagram";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3373",
  phases: [
    { id: "setup", label: "Setup", description: "Start the colouring of tree 1 at node 0." },
    { id: "colour", label: "Colour", description: "Assign each node the opposite colour of its parent." },
    { id: "bridge", label: "Bridge", description: "Choose the best bridge contribution from tree 2." },
    { id: "count", label: "Count", description: "Add the same-colour count of tree 1 to the bridge." },
    { id: "done", label: "Result", description: "Return every total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"edges1": [[0,1]], "edges2": [[0,1]]}',
  url: "https://leetcode.com/problems/maximize-the-number-of-target-nodes-after-connecting-trees-ii/",
  complexity: "O(n + m) time and O(n + m) space for tree sizes n and m. The visualization accepts at most 40 nodes per tree.",
  examples: [
    { label: "Illustrative: two small trees", input: '{"edges1": [[0,1],[0,2],[2,3]], "edges2": [[0,1],[0,2]]}' },
    { label: "Illustrative: single node in tree 2", input: '{"edges1": [[0,1]], "edges2": []}' },
  ],
};

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

export default function Problem3373Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const positions = layout(run.input.edges1);
        const nodes = [...positions.keys()].map(id => ({ id, val: id }));
        const edgeList = run.input.edges1.map(([a, b]) => ({ fromId: a, toId: b }));
        const sameColour = new Set(step.colours.map((c, id) => (step.current !== null && c === step.colours[step.current] ? id : -1)).filter(id => id >= 0));
        return (
          <>
            <TreeDiagram positions={positions} edges={edgeList} nodes={nodes}
              activeIds={new Set(step.current !== null ? [step.current] : [])}
              visitedIds={step.phase === "count" ? sameColour : new Set()}
              labelForNode={node => `colour ${step.colours[node.id] ?? "-"}`} />
            <p>Bridge contribution from tree 2: {step.bridge ?? "not yet"}</p>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
