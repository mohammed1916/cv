import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import TreeDiagram from '../../components/shared/TreeDiagram'
import { buildTrace, parseInput, code, python, pythonLineMap, examples, flattenTree } from './algorithm'

// In-order x positions and depth-based y positions; ids follow preorder.
function layout(root) {
  const nodes = flattenTree(root)
  const positions = new Map()
  const edges = []
  let x = 0
  function walk(id, depth) {
    if (id === -1) return
    walk(nodes[id].left, depth + 1)
    positions.set(id, { x: 40 + x * 48, y: 40 + depth * 70 })
    x++
    walk(nodes[id].right, depth + 1)
  }
  walk(0, 0)
  nodes.forEach(n => { if (n.left !== -1) edges.push({ fromId: n.id, toId: n.left }); if (n.right !== -1) edges.push({ fromId: n.id, toId: n.right }) })
  return { positions, nodes: nodes.map(n => ({ id: n.id, val: n.val })), edges }
}

const definition = {
  phases: [
    { id: 'scan', label: 'Scan tree', description: 'Visit each tree node as a possible start of the list.' },
    { id: 'match', label: 'Match', description: 'Follow children while the values match the list.' },
    { id: 'done', label: 'Result', description: 'Report whether a matching downward path exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Head and tree (JSON object with head and root)',
  url: 'https://leetcode.com/problems/linked-list-in-binary-tree/',
  complexity: 'O(N * min(L, H)) time and O(H) space for N tree nodes, list length L and height H. The visualization caps the tree at 50 nodes.',
  examples,
}

export default function LinkedListInBinaryTree() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { positions, nodes, edges } = layout(run.input.root)
      return <>
        <TreeDiagram positions={positions} nodes={nodes} edges={edges}
          activeIds={new Set(step.node !== null ? [step.node] : [])}
          visitedIds={new Set(step.path)} queueIds={new Set(step.stack)} />
        <IndexedSequence label="head" length={run.input.head.length} valueAt={i => run.input.head[i]} active={step.k ?? -1}
          roleAt={i => (i < step.path.length ? 'matched' : '')} />
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
