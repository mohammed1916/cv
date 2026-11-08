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
    { label: "Two small trees", input: '{"edges1": [[0,1],[0,2],[2,3]], "edges2": [[0,1],[0,2]]}' },
    { label: "Single node in tree 2", input: '{"edges1": [[0,1]], "edges2": []}' },
    { label: 'Two single nodes', input: '{"edges1":[],"edges2":[]}' },
    { label: 'Equal trees', input: '{"edges1":[[0,1],[0,2]],"edges2":[[0,1],[0,2]]}' },
    { label: 'Path against star', input: '{"edges1":[[0,1],[1,2],[2,3]],"edges2":[[0,1],[0,2],[0,3]]}' },
    { label: 'Long run: 40 and 35 nodes', input: '{"edges1":[[0,1],[1,2],[1,3],[0,4],[0,5],[4,6],[6,7],[2,8],[2,9],[2,10],[5,11],[6,12],[12,13],[1,14],[12,15],[0,16],[2,17],[3,18],[9,19],[9,20],[20,21],[3,22],[9,23],[16,24],[19,25],[8,26],[14,27],[1,28],[25,29],[28,30],[0,31],[24,32],[31,33],[16,34],[12,35],[21,36],[9,37],[26,38],[28,39]],"edges2":[[0,1],[1,2],[0,3],[0,4],[3,5],[2,6],[3,7],[0,8],[7,9],[3,10],[2,11],[0,12],[3,13],[4,14],[2,15],[15,16],[7,17],[6,18],[3,19],[17,20],[19,21],[5,22],[5,23],[10,24],[4,25],[3,26],[3,27],[3,28],[4,29],[1,30],[3,31],[19,32],[27,33],[14,34]]}' },
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
