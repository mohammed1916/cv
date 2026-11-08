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
    { label: 'Single cell', input: '[[0]]' },
    { label: 'Equal values in a 3 by 3 block', input: '[[1,1,1],[1,1,1],[1,1,1]]' },
    { label: 'Largest grid, 10 by 10', input: '[[0,1,2,3,4,5,6,7,8,9],[3,4,5,6,7,8,9,10,11,12],[6,7,8,9,10,11,12,13,14,15],[9,10,11,12,13,14,15,0,1,2],[12,13,14,15,0,1,2,3,4,5],[15,0,1,2,3,4,5,6,7,8],[2,3,4,5,6,7,8,9,10,11],[5,6,7,8,9,10,11,12,13,14],[8,9,10,11,12,13,14,15,0,1],[11,12,13,14,15,0,1,2,3,4]]' },
    { label: 'Long run: random 10 by 10 grid', input: '[[1,6,7,6,15,15,5,1,12,0],[15,2,4,10,15,14,6,2,4,14],[11,0,0,8,4,7,2,0,5,1],[4,14,3,2,5,14,14,9,4,10],[15,5,1,8,1,14,3,2,15,15],[9,9,0,4,1,9,5,8,10,11],[14,11,11,14,0,5,15,2,8,14],[7,10,11,9,13,14,5,4,9,3],[14,0,6,12,12,0,3,13,11,3],[9,4,12,2,14,6,0,9,14,10]]' },
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
