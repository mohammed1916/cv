import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Grid', description: 'Size the grid from the tree height.' },
    { id: 'place', label: 'Place node', description: 'Put each node in the middle of its column range.' },
    { id: 'done', label: 'Complete', description: 'Return the grid.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/print-binary-tree/',
  complexity: 'O(n + rows × cols) time, where cols = 2^(height+1) − 1 grows exponentially in height; the 64-item limit keeps the grid small.',
  examples: [
    { label: 'Two levels', input: '[1,2]' },
    { label: 'Three levels', input: '[1,2,3,null,4]' },
    { label: 'Single', input: '[1]' },
  ],
}

export default function PrintBinaryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <div aria-label="Printed grid" style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '.75rem' }}>
          <tbody>{step.matrix.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c} style={{ border: '1px solid var(--border)', minWidth: 22, height: 22, textAlign: 'center', background: cell ? 'var(--surface2)' : 'transparent' }}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Halving columns:</strong> the root sits in the middle; the left child takes the left half of the columns and the right child the right half, so every node is centred over its subtree.</p>
  </>} />
}
