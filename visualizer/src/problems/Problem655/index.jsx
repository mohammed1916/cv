import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Size the grid', description: 'Height sets the number of rows and the width.' },
    { id: 'place', label: 'Place a node', description: 'A node sits in the middle of its column range.' },
    { id: 'done', label: 'Complete', description: 'The matrix shows every node at its fixed position.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array, up to 127 items)',
  url: 'https://leetcode.com/problems/print-binary-tree/',
  complexity: 'O(n) placements; the matrix has (height + 1) × (2^(height+1) − 1) cells.',
  examples: [
    { label: 'Two levels', input: '[1,2]' },
    { label: 'Three levels', input: '[4,2,7,1,null,6]' },
    { label: 'Chain', input: '[3,null,5,null,9]' },
  ],
}

export default function PrintBinaryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid label={`Layout: ${step.rows} × ${step.cols}`} matrix={step.matrix}
      activeCell={step.cell} highlightedCells={step.cell ? [step.cell] : []} showFlatIndices={false} />
    <output aria-label="Layout size">{`Rows ${step.rows}, columns ${step.cols}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the middle:</strong> each child takes one half of its parent's column range, so siblings never collide and the empty cells keep the structure visible.</p>
  </>} />
}
