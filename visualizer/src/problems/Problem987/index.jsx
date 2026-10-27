import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'The root is at column 0, row 0.' },
    { id: 'visit', label: 'Place a node', description: 'Each child is one column left or right and one row lower.' },
    { id: 'done', label: 'Columns', description: 'Sort each column by row, then value.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Tree (JSON level order)',
  url: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/',
  complexity: 'O(n log n) time for the sort. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '[3,9,20,null,null,15,7]' },
    { label: 'Ties', input: '[1,2,3,4,6,5,7]' },
  ],
}

export default function VerticalOrder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <output aria-label="Columns">
        {Object.entries(step.columns).map(([col, values]) => `column ${col}: [${values.join(', ')}]`).join('; ') || 'No nodes yet'}
      </output>
    </>
  }} renderReasoning={() => <>
    <p>The column is how far left or right a node sits from the root; the row is its depth. Nodes sharing a column are listed top to bottom, and nodes at the same row and column are ordered by value.</p>
  </>} />
}
