import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Mark every guard and wall on the grid.' },
    { id: 'sweep', label: 'Sweep', description: 'Each guard looks in four directions until a wall or another guard.' },
    { id: 'done', label: 'Complete', description: 'Count the empty cells no guard can see.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"m": rows, "n": columns, "guards": [[r, c], ...], "walls": [[r, c], ...]}',
  url: 'https://leetcode.com/problems/count-unguarded-cells-in-the-grid/',
  complexity: 'Each guard sweeps at most four rays, so the work is proportional to the grid size. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Own case 1', input: '{"m":4,"n":6,"guards":[[2,3],[1,1],[0,0]],"walls":[[1,4],[2,2],[0,1]]}' },
    { label: 'Walled row', input: '{"m":1,"n":4,"guards":[[0,0]],"walls":[[0,2]]}' },
    { label: 'Single empty cell', input: '{"m":1,"n":1,"guards":[],"walls":[]}' },
    { label: 'Single guard fills the grid', input: '{"m":1,"n":1,"guards":[[0,0]],"walls":[]}' },
    { label: 'Largest grid, 6 by 6', input: '{"m":6,"n":6,"guards":[[0,0],[5,5],[2,3],[3,1]],"walls":[[0,5],[5,0],[1,1],[2,2],[3,4],[4,2]]}' },
    { label: 'Long run: 6 by 6 random', input: '{"m":6,"n":6,"guards":[[1,1],[0,4],[0,5],[0,3],[2,1],[2,5],[4,0],[1,2]],"walls":[[0,1],[5,3],[4,1],[3,4],[0,2],[5,4],[5,1],[1,4],[4,5],[1,3]]}' },
  ],
}

export default function UnguardedCells() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={step.grid} label="Grid (G guard, W wall, g guarded, . empty)" activeCell={step.guard ? { row: step.guard[0], col: step.guard[1] } : null} cellWidth={44} cellHeight={40} />
    <output aria-label="Result">{`Grid ${run.input.m} by ${run.input.n}; ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A cell is guarded when some guard can see it along a row or column with no wall or other guard between them.</p>
    <p>Sweeping outward from each guard marks exactly those cells, so the unmarked empty cells are the answer.</p>
  </>} />
}
