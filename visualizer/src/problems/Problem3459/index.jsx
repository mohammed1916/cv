import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the search with the best length at zero.' },
    { id: 'extend', label: 'Walk', description: 'Walk from a cell holding 1 in one diagonal direction, memoizing each state.' },
    { id: 'done', label: 'Complete', description: 'Report the longest segment.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a grid of 0, 1, 2 rows (up to 7 by 7)',
  url: 'https://leetcode.com/problems/length-of-longest-v-shaped-diagonal-segment/',
  complexity: 'With memoization on (cell, direction, turn used, next value) the walk is polynomial in the grid size. The visualization caps the grid at 7 by 7.',
  examples: [
    { label: 'Single 1', input: '{"grid":[[1]]}' },
    { label: 'Diagonal', input: '{"grid":[[1,0],[0,2]]}' },
  ],
}

export default function LongestVShaped() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <MatrixGrid matrix={run.input.grid} label="Grid" activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} />
      <output aria-label="Best">{`Best so far: ${step.best ?? 0}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>A segment begins at a 1 and must read 2, 0, 2, 0 and so on along a diagonal.</p>
    <p>The walk remembers whether its one clockwise turn is still available, so each state is solved once.</p>
  </>} />
}
