import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'bfs', label: 'Distance to thieves', description: 'Spread outward from every thief to measure each cell.' },
    { id: 'search', label: 'Safest search', description: 'Expand the path with the highest safeness first.' },
    { id: 'done', label: 'Complete', description: 'Report the largest safeness reaching the far corner.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Square grid of 0 (empty) and 1 (thief) (JSON)',
  url: 'https://leetcode.com/problems/find-the-safest-path-in-a-grid/',
  complexity: 'O(n^2 log n^2) time for a square grid of side n. The visualization caps the side at 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,0,0],[0,0,0],[0,0,1]]}' },
    { label: 'Example 2', input: '{"grid":[[0,0,1],[0,0,0],[0,0,0]]}' },
  ],
}

export default function SafestPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const thieves = []
    run.input.grid.forEach((row, r) => row.forEach((v, c) => { if (v === 1) thieves.push({ row: r, col: c }) }))
    const active = step.cell ? { row: step.cell[0], col: step.cell[1] } : null
    return <>
      <MatrixGrid matrix={run.input.grid} label="Thieves (1)" highlightedCells={thieves} activeCell={active} cellWidth={44} cellHeight={40} />
      <DistanceMatrixView label={step.best ? 'Best safeness reaching each cell' : 'Distance to the nearest thief'} matrix={step.best ?? step.dist} activeCell={active} />
      <output aria-label="Safeness">{step.phase === 'done' ? `Maximum safeness: ${run.result}` : 'Searching...'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A path is only as safe as its closest cell to a thief, so each step keeps the smaller of the current safeness and the next cell’s distance. Expanding the largest value first finds the best achievable bottleneck.</p>
  </>} />
}
