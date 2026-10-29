import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import TreeDiagram from '../../components/shared/TreeDiagram'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

// Lay the nodes out by depth from the (first) indegree-0 node; unreached nodes go on a row below.
function layout(input) {
  const { n, leftChild: L, rightChild: R } = input
  const indeg = Array(n).fill(0)
  L.forEach((c, i) => { if (c !== -1) indeg[c]++ })
  R.forEach((c, i) => { if (c !== -1) indeg[c]++ })
  const root = indeg.findIndex(d => d === 0)
  const depth = Array(n).fill(-1)
  if (root !== -1) {
    const queue = [root]; depth[root] = 0
    while (queue.length) {
      const v = queue.shift()
      for (const c of [L[v], R[v]]) if (c !== -1 && depth[c] === -1) { depth[c] = depth[v] + 1; queue.push(c) }
    }
  }
  const maxDepth = Math.max(0, ...depth)
  const rows = new Map()
  depth.forEach((d, v) => {
    const row = d === -1 ? maxDepth + 1 : d
    rows.set(row, [...(rows.get(row) || []), v])
  })
  const positions = new Map()
  for (const [row, ids] of rows) ids.forEach((v, j) => positions.set(v, { x: 40 + j * 56, y: 40 + row * 70 }))
  const nodes = Array.from({ length: n }, (_, v) => ({ id: v, val: v }))
  const edges = []
  for (let v = 0; v < n; v++) for (const c of [L[v], R[v]]) if (c !== -1) edges.push({ fromId: v, toId: c })
  return { positions, nodes, edges }
}

const definition = {
  phases: [
    { id: 'count', label: 'Count parents', description: 'Count how many parents each node has; two parents is invalid.' },
    { id: 'roots', label: 'Find root', description: 'Exactly one node must have no parent.' },
    { id: 'walk', label: 'Walk', description: 'Walk from the root and make sure every node is reached once.' },
    { id: 'done', label: 'Result', description: 'Report whether the nodes form one binary tree.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Tree (JSON object with n, leftChild, rightChild)',
  url: 'https://leetcode.com/problems/validate-binary-tree-nodes/',
  complexity: 'O(n) time and O(n) space. The visualization caps n at 50.',
  examples,
}

export default function ValidateBinaryTreeNodes() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { positions, nodes, edges } = layout(run.input)
      return <>
        <TreeDiagram positions={positions} nodes={nodes} edges={edges}
          activeIds={new Set(step.node !== null ? [step.node] : [])}
          visitedIds={new Set(step.visited)} queueIds={new Set(step.stack)}
          labelForNode={n => `in ${step.indegree[n.id]}`} />
        <IndexedSequence label="indegree" length={run.input.n} valueAt={i => step.indegree[i]} active={step.node ?? -1} />
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
