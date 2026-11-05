import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1351', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Sorted grid as a JSON array of rows',
  url: 'https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/',
  complexity: 'O(m + n) time, since the pointer only moves up or right, and O(1) extra space.',
}

export default function StaircaseVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const counted = []
    if (s.counted) for (let c = s.c; c < run.input[0].length; c++) counted.push({ row: s.r, col: c })
    const grid = run.input
    return <>
      <MatrixGrid matrix={grid} label="Sorted grid; the pointer starts bottom-left" activeCell={s.r >= 0 && s.c < grid[0].length ? { row: s.r, col: s.c } : null}
        highlightedCells={counted} />
      <p>Negatives counted so far: <strong>{s.count}</strong></p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Staircase walk:</strong> a negative at (r, c) means the rest of that row to the right is negative as well, so the walk moves up; otherwise it moves right.</p>
    <p>{step.message}</p>
  </>} />
}
