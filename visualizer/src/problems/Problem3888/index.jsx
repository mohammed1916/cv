import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3888View from './Problem3888View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Find the largest value; it is the lowest possible target.' },
    { id: 'target', label: 'Try target', description: 'Check one target value.' },
    { id: 'search', label: 'Cheapest', description: 'Pick the cheapest target that works.' },
    { id: 'replay', label: 'Replay', description: 'Set each cell\'s remaining need.' },
    { id: 'cell', label: 'Cell', description: 'Read the remaining need in row-major order.' },
    { id: 'place', label: 'Place', description: 'Add squares with this cell as the top-left corner.' },
    { id: 'done', label: 'Result', description: 'Report the operation count, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (rectangular, values 0 to 4) and k',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-all-grid-elements-equal/',
  complexity: 'O(T * m * n) time for T candidate targets, with T bounded by m * n * k * k * (max + 1). The visualization caps the grid at 4 by 4 with values 0 to 4. Operations only increase values, so every cell is raised to a common target.',
  examples: [
    { label: 'One square fits', input: '{"grid":[[0,0,1],[0,0,1]],"k":2}' },
    { label: 'Impossible shape', input: '{"grid":[[0,1,0],[1,1,1]],"k":2}' },
    { label: 'Single cell', input: '{"grid":[[1]],"k":1}' },
    { label: 'Equal values in a row', input: '{"grid":[[2,2,2]],"k":1}' },
    { label: 'Full grid of maximum values', input: '{"grid":[[4,4,4,4],[4,4,4,4],[4,4,4,4],[4,4,4,4]],"k":4}' },
    { label: 'Long run: 4 by 4 grid', input: '{"grid":[[3,2,2,4],[2,0,4,1],[4,3,2,0],[0,3,2,4]],"k":2}' },
  ],
}

export default function Problem3888Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3888View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each square placed at a cell is forced by that cell's remaining need, because squares that could cover it must start at or before it in row-major order.</p>
  </>} />
}
