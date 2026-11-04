import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { useMemo } from 'react'
import TreeDiagram from '../../components/shared/TreeDiagram'
import { layoutTree } from '../../components/shared/treeLayout'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '144',
  inputLabel: 'Tree in level order as a JSON array (null = no child)',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Balanced', input: '[5,3,8,1,4,null,9]' },
    { label: 'Right lean', input: '[1,null,2,null,3]' },
    { label: 'Sparse', input: '[9,null,4,2,null,8,null,null,6]' },
  ],
  complexity: 'Time O(n) · Space O(h) for the explicit stack, where h is the tree height.',
  url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/',
}

const box = {
  display: 'inline-block', minWidth: 34, margin: 2, padding: '4px 8px', borderRadius: 6,
  border: '1px solid currentColor', textAlign: 'center',
}

function treeDrawing(root) {
  if (!root) return { positions: new Map(), edges: [], nodes: [] }
  const { positions, edges } = layoutTree(root)
  const nodes = []
  const walk = node => { if (!node) return; nodes.push({ id: node.id, val: node.val }); walk(node.left); walk(node.right) }
  walk(root)
  return { positions, nodes, edges: edges.map(e => ({ fromId: e.from, toId: e.to })) }
}

function PreorderVisual({ step }) {
  const { stack, output, current, pushed, tree, stackIds = [], outputIds = [], currentId = null } = step.snapshot
  const drawing = useMemo(() => treeDrawing(tree), [tree])
  return <div style={{ padding: 8 }}>
    <TreeDiagram positions={drawing.positions} edges={drawing.edges} nodes={drawing.nodes}
      activeIds={new Set(currentId === null ? [] : [currentId])} visitedIds={new Set(outputIds)} queueIds={new Set(stackIds)} />
    <h4>Stack (top on the right)</h4>
    <div>{stack.length ? stack.map((v, i) => <span key={i} style={{ ...box, background: pushed?.includes(v) ? 'rgba(8,145,178,0.25)' : 'transparent' }}>{v}</span>)
      : <em>empty</em>}</div>
    <h4>Recorded in preorder</h4>
    <div>{output.length ? output.map((v, i) => <span key={i} style={{ ...box, background: i === output.length - 1 && current !== null ? 'rgba(8,145,178,0.25)' : 'transparent' }}>{v}</span>)
      : <em>nothing yet</em>}</div>
    {current !== null && <p>Current node: {current}</p>}
  </div>
}

export default function BinaryTreePreorderTraversal() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <PreorderVisual step={step} />}
    renderReasoning={() => <p>Preorder records a node before its subtrees. A stack reproduces the recursive order: push right, then left, so left is popped first.</p>} />
}
