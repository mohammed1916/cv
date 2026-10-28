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
    { label: 'Example 1', input: '{"m":4,"n":6,"guards":[[0,0],[1,1],[2,3]],"walls":[[0,1],[2,2],[1,4]]}' },
    { label: 'Walled row', input: '{"m":1,"n":4,"guards":[[0,0]],"walls":[[0,2]]}' },
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
