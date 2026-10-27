import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The tree is labelled level by level from 1.' },
    { id: 'query', label: 'Query', description: 'Start from the two labels of the new edge.' },
    { id: 'climb', label: 'Climb', description: 'Move the larger label up to its parent.' },
    { id: 'answer', label: 'Answer', description: 'The labels meet; the cycle is the path plus the new edge.' },
    { id: 'done', label: 'Complete', description: 'Report all cycle lengths.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (levels, 2 to 4) and queries [a, b] (JSON)',
  url: 'https://leetcode.com/problems/cycle-length-queries-in-a-tree/',
  complexity: 'O(log n) per query. The visualization caps the tree at 4 levels.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"queries":[[5,3],[4,7],[2,3]]}' },
    { label: 'Example 2', input: '{"n":2,"queries":[[1,2]]}' },
  ],
}

export default function CycleLengthQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const values = Array.from({ length: run.count }, (_, i) => i + 1)
    const tree = treeFromLevelOrder(values)
    const roles = {}
    for (const label of step.nodes) {
      const node = findByValue(tree, label)
      if (node) roles[node.id] = 'visited'
    }
    return <>
      <BinaryTreeLane title="Perfect binary tree (labels)" root={tree} roles={roles} />
      <output aria-label="Step">{`Current nodes: ${step.nodes.join(', ') || '—'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Labels follow heap order, so the parent of v is floor(v / 2), and the larger label is always deeper or equal.</p>
    <p>Halving the larger label until both match finds the path length between them without building the tree.</p>
  </>} />
}

function findByValue(node, value) {
  if (!node) return null
  if (node.value === value) return node
  return findByValue(node.left, value) || findByValue(node.right, value)
}
