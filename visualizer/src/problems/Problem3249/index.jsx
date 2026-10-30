import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeDiagram from "../../components/shared/TreeDiagram";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3249",
  phases: [
    { id: "build", label: "Build", description: "Create the adjacency list." },
    { id: "root", label: "Root", description: "Root the tree at node 0." },
    { id: "size", label: "Size", description: "Compute each subtree size, bottom up." },
    { id: "good", label: "Good", description: "Count nodes whose child sizes match." },
    { id: "check", label: "Check", description: "Skip nodes whose child sizes differ." },
    { id: "done", label: "Result", description: "Return the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Tree edges (JSON, e.g. {"edges": [[0,1],[0,2],[1,3]]})',
  url: "https://leetcode.com/problems/count-the-number-of-good-nodes/",
  complexity: "O(n) time and O(n) space with one traversal order. The visualization accepts at most 12 nodes.",
  examples: [
    { label: "Small tree (illustrative)", input: '{"edges": [[0,1],[0,2],[1,3],[1,4]]}' },
    { label: "Path (illustrative)", input: '{"edges": [[0,1],[1,2],[2,3]]}' },
  ],
};

function layout(edges) {
  const n = edges.length + 1
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })
  const depth = Array(n).fill(-1)
  depth[0] = 0
  const queue = [0]
  const levels = []
  while (queue.length) {
    const node = queue.shift()
    if (!levels[depth[node]]) levels[depth[node]] = []
    levels[depth[node]].push(node)
    adj[node].forEach(next => { if (depth[next] < 0) { depth[next] = depth[node] + 1; queue.push(next) } })
  }
  const positions = new Map()
  levels.forEach((ids, row) => ids.forEach((id, column) => positions.set(id, { x: 60 + column * 90, y: 50 + row * 90 })))
  return positions
}

export default function GoodNodesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const { edges } = run.input
        const n = edges.length + 1
        const positions = layout(edges)
        const nodes = Array.from({ length: n }, (_, id) => ({ id, val: id }))
        const treeEdges = edges.map(([u, v]) => (step.parent[v] === u ? { fromId: u, toId: v } : { fromId: v, toId: u }))
        const goodIds = new Set(step.good.map((flag, id) => (flag ? id : -1)).filter(id => id >= 0))
        return (
          <div>
            <TreeDiagram positions={positions} edges={treeEdges} nodes={nodes}
              activeIds={new Set(step.node >= 0 ? [step.node] : [])} visitedIds={goodIds}
              labelForNode={node => (step.size[node.id] !== undefined ? `size ${step.size[node.id]}${goodIds.has(node.id) ? " good" : ""}` : "")} />
            <p>Good nodes so far: {step.count}</p>
          </div>
        )
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
