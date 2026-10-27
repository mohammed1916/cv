import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Top-left', description: 'The top-left cell starts both the largest and smallest products.' },
    { id: 'cell', label: 'Cell', description: 'Multiply the cell by the largest and smallest products reaching it from above or from the left.' },
    { id: 'done', label: 'Complete', description: 'Report the largest product at the bottom-right cell, or -1 if it is negative.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with grid rows of integers from -4 to 4)',
  url: 'https://leetcode.com/problems/maximum-non-negative-product-in-a-matrix/',
  complexity: 'O(m * n) time with two products per cell. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Two negatives', input: '{"grid":[[1,-2,1],[1,-2,1],[3,-4,1]]}' },
    { label: 'Always negative', input: '{"grid":[[-1,-2,-3],[-2,-3,-3],[-3,-3,-2]]}' },
  ],
}

const show = table => table.map(row => row.map(v => (v === null ? '·' : v)))

export default function MaxNonNegativeProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const active = { row: step.row, col: step.col }
    return <>
      <MatrixGrid matrix={run.grid} label="Grid" activeCell={active} />
      <MatrixGrid matrix={show(step.big)} label="Largest product reaching each cell (· = not yet)" activeCell={active} />
      <MatrixGrid matrix={show(step.small)} label="Smallest product reaching each cell (· = not yet)" activeCell={active} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Multiplying by a negative value swaps the roles of the largest and smallest products, so each cell keeps both.</p>
    <p>A product can end up non-negative from two negatives, so the smallest product is needed, not only the largest.</p>
  </>} />
}
