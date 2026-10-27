import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First row', description: 'The first row is the cost of starting each path.' },
    { id: 'cell', label: 'Cell', description: 'Add this cell to the smallest value above it outside its column.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest total in the last row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Square grid (JSON object with a grid of integers from -9 to 9, up to 5 by 5)',
  url: 'https://leetcode.com/problems/minimum-falling-path-sum-ii/',
  complexity: 'O(n^3) time with the smallest value outside a column found by a scan. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Official', input: '{"grid":[[1,2,3],[4,5,6],[7,8,9]]}' },
    { label: 'Same column', input: '{"grid":[[1,5],[1,9]]}' },
  ],
}

export default function MinimumFallingPathSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.grid} label="Grid" activeCell={step.col >= 0 ? { row: step.row, col: step.col } : null} />
    <MatrixGrid matrix={step.table} label="Best total for each cell" activeCell={step.col >= 0 ? { row: step.row, col: step.col } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each row chooses one cell, and consecutive rows must use different columns. For a cell, the best path above it is the smallest total in the row above, skipping its own column.</p>
    <p>The visualization fills one row at a time, so every cell shows the total of the best path that ends there.</p>
  </>} />
}
