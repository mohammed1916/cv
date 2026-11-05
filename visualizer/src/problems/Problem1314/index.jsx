import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { code, python, parseInput, buildTrace, phases, examples } from './algorithm'

const definition = {
  number: '1314', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Matrix and k (JSON object)',
  url: 'https://leetcode.com/problems/matrix-block-sum/',
  complexity: 'O(m n) time and space: one pass for the prefix table and one constant-time block read per cell.',
}

export default function BlockSumVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const b = s.block
    const cells = []
    if (b) for (let r = b.r1; r <= b.r2; r++) for (let c = b.c1; c <= b.c2; c++) cells.push({ row: r, col: c })
    return <>
      <MatrixGrid matrix={run.input.mat} label="Matrix; the highlighted block is the k-window of the current cell" highlightedCells={cells}
        activeCell={s.cell ?? null} />
      <MatrixGrid matrix={s.P.slice(1).map(row => row.slice(1))} label="Prefix sums (top-left corner to each cell)" showFlatIndices={false} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Clip, then subtract:</strong> the block around a cell is the prefix rectangle with the four corners removed, after clipping to the matrix edges.</p>
    <p>{step.message}</p>
  </>} />
}
