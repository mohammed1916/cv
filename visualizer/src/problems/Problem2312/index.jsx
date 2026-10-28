import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty boards', description: 'A board with no area is worth nothing.' },
    { id: 'cell', label: 'Board value', description: 'Compare the best single piece with every edge-to-edge cut.' },
    { id: 'done', label: 'Complete', description: 'Report the value of the full board.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with m, n, and prices as [height, width, price] (JSON)',
  url: 'https://leetcode.com/problems/selling-pieces-of-wood/',
  complexity: 'O(m * n * (m + n)) time and O(m * n) space. The visualization caps the board at 6 by 6 with up to 6 pieces.',
  examples: [
    { label: 'Example 1', input: '{"m":3,"n":5,"prices":[[1,4,2],[2,2,7],[2,1,3]]}' },
    { label: 'Example 2', input: '{"m":4,"n":6,"prices":[[3,2,10],[1,4,2],[4,1,3]]}' },
  ],
}

export default function SellingPiecesOfWood() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Best value (rows: height, columns: width)" values={step.table}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Result">{step.phase === 'done' ? `Answer: ${run.result}` : `Board ${run.input.m} by ${run.input.n}`}</output>
  </>} renderReasoning={() => <>
    <p>Pieces cannot be rotated, and each cut runs from one edge of the board to the other, so every board splits into two smaller boards.</p>
    <p>A board is worth either its best single piece or the best sum of two smaller boards from one cut.</p>
  </>} />
}
