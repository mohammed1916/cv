import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the grid of grass, fire and walls.' },
    { id: 'fire', label: 'Fire', description: 'Breadth-first search gives the minute each cell burns.' },
    { id: 'search', label: 'Search', description: 'Binary search over the waiting time.' },
    { id: 'done', label: 'Result', description: 'The largest safe wait, -1, or 1000000000.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (0 grass, 1 fire, 2 wall)',
  url: 'https://leetcode.com/problems/escape-the-spreading-fire/',
  complexity: 'O(m * n * log(m * n)) time: each binary-search check is one breadth-first walk. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example', input: '{"grid":[[0,2,0,0,0,0,0],[0,0,0,2,2,1,0],[0,2,0,0,1,2,0],[0,0,2,2,2,0,2],[0,0,0,0,0,0,0]]}' },
    { label: 'Blocked', input: '{"grid":[[0,0,0,0],[0,1,2,0],[0,2,0,0]]}' },
    { label: 'Safe forever', input: '{"grid":[[0,0,0],[2,2,0],[1,2,0]]}' },
  ],
}

export default function EscapeSpreadingFire() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} activeCell={step.at && step.at[0] >= 0 ? { row: step.at[0], col: step.at[1] } : null} />
    <output aria-label="Wait search">{step.t >= 0 ? `Testing wait ${step.t}; range [${step.lo}, ${step.hi}]` : step.lo >= 0 && step.hi >= 0 && step.phase === 'search' ? `Range [${step.lo}, ${step.hi}]` : 'Fire spreads from every fire cell.'}</output>
  </>} renderReasoning={() => <>
    <p>Each cell gets the minute the fire reaches it. The person must enter a cell strictly before the fire, except the safehouse, where arriving in the same minute is safe.</p>
    <p>If waiting t minutes works, waiting less also works, so the largest working wait is found by binary search.</p>
  </>} />
}
