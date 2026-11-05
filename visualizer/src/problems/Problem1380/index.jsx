import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1380', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with a matrix of distinct values (JSON)',
  url: 'https://leetcode.com/problems/lucky-numbers-in-a-matrix/',
  complexity: 'O(m n) time, since each row and each column is scanned a constant number of times, and O(m + n) extra space.',
}

export default function LuckyNumbersVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const row = s.row === undefined ? [] : Array.from({ length: run.input.matrix[0].length }, (_, c) => ({ row: s.row, col: c }))
    const col = s.col === undefined ? [] : Array.from({ length: run.input.matrix.length }, (_, r) => ({ row: r, col: s.col }))
    return <>
      <MatrixGrid matrix={run.input.matrix} label="Matrix: the row being read is highlighted, and its column is traced down"
        highlightedCells={[...row, ...col]} activeCell={s.row !== undefined && s.col !== undefined ? { row: s.row, col: s.col } : null} />
      <StackLane title="Lucky numbers found" items={s.found.map(String)} note={s.value !== undefined ? `checking ${s.value}` : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Saddle point:</strong> a value that is both the smallest in its row and the largest in its column is unique to that cell, so each row needs one row-minimum check and one column check.</p>
    <p>{step.message}</p>
  </>} />
}
