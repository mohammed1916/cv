import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { Vars } from './SeqKit'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function LargestBorderedSquare() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const highlighted = []
    if (s.corner && s.size) {
      const [i, j] = s.corner
      for (let k = 0; k < s.size; k++) {
        highlighted.push({ row: i, col: j + k }, { row: i + s.size - 1, col: j + k }, { row: i + k, col: j }, { row: i + k, col: j + s.size - 1 })
      }
    }
    const active = s.corner ? { row: s.corner[0], col: s.corner[1] } : null
    return <>
      <MatrixGrid matrix={s.grid} label="Grid: the candidate square's border is highlighted" activeCell={active} highlightedCells={highlighted} cellWidth={40} cellHeight={40} />
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <MatrixGrid matrix={s.right} label="Run of ones to the right" activeCell={active} cellWidth={40} cellHeight={40} />
        <MatrixGrid matrix={s.down} label="Run of ones downward" activeCell={active} cellWidth={40} cellHeight={40} />
      </div>
      <Vars vars={{ corner: s.corner ? `row ${s.corner[0]}, col ${s.corner[1]}` : null, 'side tested': s.size, 'best side so far': s.best }} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Runs first:</strong> each cell stores how many ones continue to its right and downward. Those two runs are all a corner needs.</p>
    <p><strong>Corner test:</strong> a square with a top-left corner at a one has a border of ones when its bottom run and right run both reach its side length.</p>
  </>} />
}
