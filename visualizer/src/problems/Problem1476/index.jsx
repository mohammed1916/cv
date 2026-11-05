import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1476', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with rectangle and ops (JSON)',
  url: 'https://leetcode.com/problems/subrectangle-queries/',
  complexity: 'O(r c) per update in this direct version, and O(1) per read.',
}

export default function SubrectangleVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const box = s.box ? Array.from({ length: s.box.r2 - s.box.r1 + 1 }, (_, i) => s.box.r1 + i).flatMap(r =>
      Array.from({ length: s.box.c2 - s.box.c1 + 1 }, (_, j) => ({ row: r, col: s.box.c1 + j }))) : []
    return <>
      <MatrixGrid matrix={s.rect} label="Current rectangle (the updated block is highlighted)" highlightedCells={box}
        activeCell={s.cell ? { row: s.cell.row, col: s.cell.col } : null} />
      <p>Answers so far: <strong>{s.answers.length ? s.answers.map(a => (a === null ? 'null' : a)).join(', ') : 'none yet'}</strong></p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Apply in order:</strong> each update overwrites a block, and each read sees the latest write covering its cell.</p>
    <p>{step.message}</p>
  </>} />
}
