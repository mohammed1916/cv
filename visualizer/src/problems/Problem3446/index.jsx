import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the original matrix.' },
    { id: 'diagonal', label: 'Sort diagonal', description: 'Sort one diagonal in its direction and write it back.' },
    { id: 'done', label: 'Complete', description: 'Return the matrix with every diagonal sorted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"grid": [[...], ...]} square matrix',
  url: 'https://leetcode.com/problems/sort-matrix-by-diagonals/',
  complexity: 'Each diagonal is sorted once, so the work is about n^2 log n. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,7,3],[9,8,2],[4,5,6]]}' },
    { label: 'Two by two', input: '{"grid":[[1,2],[3,4]]}' },
    { label: 'Single cell', input: '{"grid":[[4]]}' },
    { label: 'Equal values tie', input: '{"grid":[[5,5],[5,5]]}' },
    { label: 'Extreme values', input: '{"grid":[[0,20,0,20,0,20],[0,20,0,20,0,20],[0,20,0,20,0,20],[0,20,0,20,0,20],[0,20,0,20,0,20],[0,20,0,20,0,20]]}' },
    { label: 'Long run: 6 by 6', input: '{"grid":[[12,8,11,15,7,17],[15,4,13,12,17,17],[1,11,4,17,19,17],[14,4,0,1,18,2],[0,17,18,9,0,1],[18,3,4,6,3,16]]}' },
  ],
}

export default function SortMatrixDiagonals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid matrix={step.matrix} label="Matrix" highlightedCells={step.cells.map(([row, col]) => ({ row, col }))} cellWidth={44} cellHeight={40} />
    <output aria-label="Diagonal">{step.diagonal === null ? 'All diagonals sorted' : `Diagonal ${step.diagonal}: ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>The cells on one diagonal share the same row minus column, so each diagonal can be gathered, sorted, and written back on its own.</p>
    <p>On and below the main diagonal the values go largest first, and above it they go smallest first.</p>
  </>} />
}
