import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'List every 3x3 window.' },
    { id: 'window', label: 'Window', description: 'Select the next window.' },
    { id: 'reject', label: 'Reject', description: 'The window fails a quick or full check.' },
    { id: 'accept', label: 'Accept', description: 'All digits and all eight line sums check out.' },
    { id: 'done', label: 'Complete', description: 'Return the count of magic squares.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Grid (JSON 2-D array)',
  url: 'https://leetcode.com/problems/magic-squares-in-grid/',
  complexity: 'O(R*C) time (each window costs a constant 9 cells) and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '[[4,3,8,4],[9,5,1,9],[2,7,6,2]]' },
    { label: 'Example 2', input: '[[8]]' },
    { label: 'Two squares', input: '[[4,3,8,4,3,8],[9,5,1,9,5,1],[2,7,6,2,7,6],[1,1,1,1,1,1]]' },
  ],
}
export default function MagicSquaresInGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const related = []
    if (step.r >= 0) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) related.push({ row: step.r + i, column: step.c + j })
    return <>
      <DPTable title="Grid (current 3x3 window highlighted)" values={run.input} activeCell={step.r >= 0 ? { row: step.r + 1, column: step.c + 1 } : null} relatedCells={related} />
      <output aria-label="Count">{step.phase === 'done' ? 'Magic squares' : 'Found so far'}: {step.count}</output>
      <p>Accepted windows (top-left): {step.found.length ? step.found.map(([r, c]) => `(${r},${c})`).join(' ') : 'none'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why check the centre first:</strong> the centre of a 3x3 magic square of 1-9 is on four lines (row, column, two diagonals) that each sum to 15, forcing it to be 5. This prunes most windows cheaply.</p>
    <p><strong>Then:</strong> the cells must be exactly the digits 1-9 and all eight lines must total 15.</p>
  </>} />
}
