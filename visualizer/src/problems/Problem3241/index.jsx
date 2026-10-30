import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeDiagram from "../../components/shared/TreeDiagram";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3241",
  phases: [
    { id: "build", label: "Build", description: "Create the adjacency list." },
    { id: "root", label: "Root", description: "Root the tree and record the visit order." },
    { id: "down", label: "Down", description: "Compute times through children, bottom up." },
    { id: "up", label: "Up", description: "Compute times through parents, top down." },
    { id: "answer", label: "Answer", description: "Combine both directions for each start node." },
    { id: "done", label: "Result", description: "Return every start node's time." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Tree edges (JSON, e.g. {"edges": [[0,1],[0,2]]})',
  url: "https://leetcode.com/problems/time-taken-to-mark-all-nodes/",
  complexity: "O(n) time and O(n) space with two passes over a rooted tree. The visualization accepts at most 12 nodes.",
  examples: [
    { label: "Star (from search summary)", input: '{"edges": [[0,1],[0,2]]}' },
    { label: "Two nodes (from search summary)", input: '{"edges": [[0,1]]}' },
    { label: "Five nodes (from search summary)", input: '{"edges": [[2,4],[0,1],[2,3],[0,2]]}' },
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

export default function TimeTakenTreeVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const { edges } = run.input
        const n = edges.length + 1
        const positions = layout(edges)
        const nodes = Array.from({ length: n }, (_, id) => ({ id, val: id }))
        const treeEdges = edges.map(([u, v]) => (step.parent[v] === u ? { fromId: u, toId: v } : { fromId: v, toId: u }))
        const label = node => (step.answer[node] !== undefined && step.phase === "answer" && node <= step.node ? `ans ${step.answer[node]}`
          : step.down && step.phase === "down" && node === step.node ? `down ${step.down[node]}` : step.up && step.phase === "up" && node === step.node ? `up ${step.up[node]}` : "")
        return (
          <div>
            <TreeDiagram positions={positions} edges={treeEdges} nodes={nodes} activeIds={new Set([step.node])}
              labelForNode={node => label(node.id)} />
            <p>{step.message}</p>
          </div>
        )
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
