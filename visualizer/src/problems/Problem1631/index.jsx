import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top-left cell with effort 0.' },
    { id: 'settle', label: 'Expand cell', description: 'Take the cell with the least effort so far.' },
    { id: 'relax', label: 'Step', description: 'Record the effort of a step to a neighbouring cell.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum effort to the bottom-right cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Heights grid (JSON)',
  url: 'https://leetcode.com/problems/path-with-minimum-effort/',
  complexity: 'O(m n log(m n)) time. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Example 1', input: '{"heights":[[1,2,2],[3,8,2],[5,3,5]]}' },
    { label: 'Flat', input: '{"heights":[[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]]}' },
    { label: "Single cell", input: "{\"heights\":[[5]]}" },
    { label: "Equal heights", input: "{\"heights\":[[2,2],[2,2]]}" },
    { label: "Five by five, extremes", input: "{\"heights\":[[1,9,1,9,1],[9,1,9,1,9],[1,9,1,9,1],[9,1,9,1,9],[1,9,1,9,1]]}" },
    { label: "Long run: 5 by 5", input: "{\"heights\":[[4,4,3,7,5],[6,4,5,2,8],[1,5,5,2,1],[4,1,1,2,8],[4,2,8,8,2]]}" },
  ],
}

export default function MinimumEffortPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const active = step.cell ? { row: step.cell[0], col: step.cell[1] } : null
    return <>
      <MatrixGrid matrix={run.input.heights} label="Heights" activeCell={active} cellWidth={44} cellHeight={40} />
      <DistanceMatrixView label="Least effort to reach each cell" matrix={step.matrix} activeCell={active} />
      <output aria-label="Effort">{step.phase === 'done' ? `Minimum effort: ${run.result}` : `Current effort: ${step.value}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Effort is a maximum rather than a sum, but it still never decreases along a path. Expanding the cell with the least effort so far is therefore exact, the same argument as Dijkstra.</p>
  </>} />
}
