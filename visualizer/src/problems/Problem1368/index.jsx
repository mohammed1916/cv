import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const ARROWS = ['', '→', '←', '↓', '↑']

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed the deque with the top-left cell at cost 0.' },
    { id: 'pop', label: 'Pop front', description: 'Take the cheapest unsettled cell from the front.' },
    { id: 'relax', label: 'Relax', description: 'Improve a neighbour: cost 0 goes to the front, cost 1 to the back.' },
    { id: 'done', label: 'Complete', description: 'Report the cost of the bottom-right cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Grid (JSON rows of arrows 1 to 4)',
  url: 'https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/',
  complexity: 'O(m n) time: every cell has four edges of cost 0 or 1, so a deque gives 0-1 BFS. Visualization limited to 6 by 6.',
  examples: [
    { label: 'cost 3', input: '[[1,1,1,1],[2,2,2,2],[1,1,1,1],[2,2,2,2]]' },
    { label: 'cost 0', input: '[[1,1,3],[3,2,2],[1,1,4]]' },
    { label: 'cost 1', input: '[[1,2],[4,3]]' },
  ],
}

export default function MinCostValidPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Arrows (row-major; 1 right, 2 left, 3 down, 4 up)" length={run.input.length * run.input[0].length} valueAt={i => ARROWS[run.input[Math.floor(i / run.input[0].length)][i % run.input[0].length]]} active={step.cell ? step.cell[0] * run.input[0].length + step.cell[1] : -1} />
    <DistanceMatrixView label="Cheapest cost so far to each cell" matrix={step.matrix} activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} queueLabel="Deque (front to back)" queue={step.queue} />
    <output aria-label="Answer">{step.phase === 'done' ? `Minimum cost: ${run.result}` : 'Searching...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A plain BFS counts steps, not cost. Here the cost is 0 or 1 per edge, so a deque keeps the deque sorted by distance: cost-0 neighbours go to the front, cost-1 neighbours to the back.</p>
  </>} />
}
