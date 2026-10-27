import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed the deque with the empty top-left cell.' },
    { id: 'pop', label: 'Pop front', description: 'Take the cell with the fewest obstacles removed so far.' },
    { id: 'relax', label: 'Relax', description: 'Step to a neighbour: an empty cell goes to the front, an obstacle to the back.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest obstacles removed on the way to the corner.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Grid (JSON rows of 0 empty and 1 obstacle)',
  url: 'https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/',
  complexity: 'O(m n) time: each step costs 0 or 1, so a deque gives 0-1 BFS. Visualization limited to 6 by 6.',
  examples: [
    { label: 'remove 2', input: '[[0,1,1],[1,1,0],[1,1,0]]' },
    { label: 'remove 0', input: '[[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0]]' },
  ],
}

export default function MinObstacleRemoval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Grid cells (row-major; 1 is an obstacle)" length={run.input.length * run.input[0].length} valueAt={i => run.input[Math.floor(i / run.input[0].length)][i % run.input[0].length]} active={step.cell ? step.cell[0] * run.input[0].length + step.cell[1] : -1} />
    <DistanceMatrixView label="Fewest obstacles removed so far to each cell" matrix={step.matrix} activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} queueLabel="Deque (front to back)" queue={step.queue} />
    <output aria-label="Answer">{step.phase === 'done' ? `Obstacles to remove: ${run.result}` : 'Searching...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Removing an obstacle and walking through empty cells are not the same cost, so BFS by steps is wrong. The deque keeps cells in order of obstacles removed: empty steps go to the front, obstacle steps to the back.</p>
  </>} />
}
