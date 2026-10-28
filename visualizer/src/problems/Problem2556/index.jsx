import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Look for any route of ones from top-left to bottom-right.' },
    { id: 'route', label: 'Route found', description: 'Every single cut must lie on this route.' },
    { id: 'candidate', label: 'Test a cell', description: 'Flip one interior route cell and search again.' },
    { id: 'done', label: 'Answer', description: 'Report whether one flip can disconnect the route.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a 0/1 grid',
  url: 'https://leetcode.com/problems/disconnect-path-in-a-binary-matrix-by-at-most-one-flip/',
  complexity: 'O(L * mn) time for a route of length L, since each candidate triggers one search. The visualization caps the grid at 7 by 7.',
  examples: [
    { label: 'Single route', input: '{"grid":[[1,1,1]]}' },
    { label: 'Two routes', input: '{"grid":[[1,1],[1,1]]}' },
  ],
}

export default function DisconnectPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const route = step.route.map(([row, col]) => ({ row, col }))
    return <>
      <MatrixGrid label="Binary grid" matrix={run.input.grid} highlightedCells={route}
        activeCell={step.candidate ? { row: step.candidate[0], col: step.candidate[1] } : null} />
      <output aria-label="Flip status">{step.candidate ? `Candidate flip: (${step.candidate[0]}, ${step.candidate[1]})` : 'Shaded cells form the route found'}</output>
    </>
  }} renderReasoning={() => <>
    <p>A single flip can only disconnect the start from the end if it removes a cell that every route uses, so the search only tries cells on one shortest route.</p>
    <p>If the start and end are already disconnected, zero flips suffice and the answer is true.</p>
  </>} />
}
