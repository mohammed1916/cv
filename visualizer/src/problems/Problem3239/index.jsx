import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the row and column flip counts.' },
    { id: 'row', label: 'Row pairs', description: 'Compare mirror cells along each row.' },
    { id: 'column', label: 'Column pairs', description: 'Compare mirror cells down each column.' },
    { id: 'done', label: 'Choose', description: 'Take the cheaper of the two directions.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a 0/1 grid',
  url: 'https://leetcode.com/problems/minimum-number-of-flips-to-make-binary-grid-palindromic-i/',
  complexity: 'O(mn) time and O(1) extra space. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,0,0],[0,0,0],[0,0,1]]}' },
    { label: 'Example 2', input: '{"grid":[[0,1],[0,1],[0,0]]}' },
  ],
}

export default function MinFlipsPalindromic() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pair = step.pair ? step.pair.map(([row, col]) => ({ row, col })) : []
    return <>
      <MatrixGrid label="Binary grid" matrix={run.input.grid} highlightedCells={pair} />
      <output aria-label="Flip totals">{`Row flips: ${step.rowFlips}, column flips: ${step.colFlips}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A row is a palindrome when each cell matches its mirror across the middle. Each mismatched pair costs one flip, so the row cost is the number of mismatched pairs in all rows.</p>
    <p>The same count run down the columns gives the column cost, and the answer is the smaller of the two.</p>
  </>} />
}
