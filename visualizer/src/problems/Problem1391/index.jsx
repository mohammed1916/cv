import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1391', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with a grid of street types 1 to 6 (JSON)',
  url: 'https://leetcode.com/problems/check-if-there-is-a-valid-path-in-a-grid/',
  complexity: 'O(m n) time and O(m n) space, since each cell is queued at most once. The visualization caps the grid at 8 by 8.',
}

export default function StreetPathVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const seen = s.seen.map(k => { const [r, c] = k.split(',').map(Number); return { row: r, col: c } })
    const active = s.cell ? { row: s.cell[0], col: s.cell[1] } : null
    return <>
      <MatrixGrid matrix={run.input.grid} label="Street types; visited cells are highlighted" highlightedCells={seen} activeCell={active} />
      <StackLane title="Queue of cells to visit" items={s.queue} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two-way streets:</strong> a move is allowed only when the street on the current cell opens that way and the street on the neighbour opens back.</p>
    <p>{step.message}</p>
  </>} />
}
