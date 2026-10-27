import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the top-left cell to second 0.' },
    { id: 'pop', label: 'Settle cell', description: 'Take the earliest known arrival and expand its neighbours.' },
    { id: 'push', label: 'Arrival', description: 'Record a neighbour arrival, bouncing when the cell is not open yet.' },
    { id: 'done', label: 'Complete', description: 'Report the earliest arrival at the bottom-right cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Opening times grid (JSON)',
  url: 'https://leetcode.com/problems/minimum-time-to-visit-a-cell-in-a-grid/',
  complexity: 'O(m n log(m n)) time. The visualization caps input at 5 by 5 with values up to 12.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,1,3,2],[5,1,2,5],[4,3,8,6]]}' },
    { label: 'Blocked', input: '{"grid":[[0,2,4],[3,2,1],[1,0,4]]}' },
  ],
}

export default function MinimumTimeToVisitCell() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.input.grid} label="Cell opens at second" activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} cellWidth={44} cellHeight={40} />
    <DistanceMatrixView label="Earliest arrival so far" matrix={step.best} activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} />
    <output aria-label="Time">{step.phase === 'done' ? `Answer: ${run.result}` : `Current second: ${step.time}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Because you can step back and forth between two neighbours, you can wait in a cell by two seconds at a time. A cell is therefore reachable at any time with the parity of its row plus column, once it has opened.</p>
  </>} />
}
