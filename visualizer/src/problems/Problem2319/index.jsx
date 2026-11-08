import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Assume an X-matrix until a cell disagrees.' },
    { id: 'check', label: 'Check cell', description: 'Diagonal cells must be nonzero; all others must be zero.' },
    { id: 'fail', label: 'Mismatch', description: 'This cell breaks the rule, so the answer is no.' },
    { id: 'done', label: 'Complete', description: 'Report whether the matrix is an X-matrix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"grid": [[...], ...]} square matrix',
  url: 'https://leetcode.com/problems/check-if-matrix-is-x-matrix/',
  complexity: 'One pass over the n by n cells: O(n^2) time. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'X-matrix', input: '{"grid":[[2,0,0,1],[0,3,1,0],[0,5,2,0],[4,0,0,2]]}' },
    { label: 'Not X', input: '{"grid":[[5,7,0],[0,3,1],[0,5,0]]}' },
    { label: 'Smallest X-matrix', input: '{"grid":[[1,0,1],[0,2,0],[3,0,4]]}' },
    { label: 'Stray value in a corner', input: '{"grid":[[1,0,0],[0,1,0],[9,0,1]]}' },
    { label: 'Zero on the diagonal breaks it', input: '{"grid":[[0,0,0],[0,1,0],[0,0,1]]}' },
    { label: 'Largest 6 by 6 X-matrix', input: '{"grid":[[2,0,0,0,0,6],[0,6,0,0,5,0],[0,0,9,6,0,0],[0,0,9,2,0,0],[0,2,0,0,8,0],[9,0,0,0,0,8]]}' },
    { label: 'Long run: 6 by 6 with one stray value', input: '{"grid":[[9,0,0,0,0,2],[0,5,0,0,0,0],[3,0,8,6,0,0],[0,0,8,1,0,0],[0,2,0,0,7,0],[7,0,0,0,0,5]]}' },
  ],
}

export default function XMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.input.grid} label="Matrix" activeCell={step.row === null ? null : { row: step.row, col: step.col }} cellWidth={44} cellHeight={40} />
    <p>{step.row === null ? 'Pointers i and j wait for the first cell.' : `Pointers: i = row ${step.row}, j = column ${step.col}`}</p>
    <output aria-label="Result">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>An X-matrix has nonzero values exactly on its two diagonals, so each cell is tested against whether it lies on a diagonal.</p>
    <p>The first cell that breaks the pattern settles the answer.</p>
  </>} />
}
