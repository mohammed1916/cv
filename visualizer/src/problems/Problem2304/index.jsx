import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First row', description: 'Each cell of the first row starts a path at its own value.' },
    { id: 'cell', label: 'Cell', description: 'Find the cheapest arrival into this column, then add its value.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest path that ends in the last row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and move costs (JSON object with grid and move_cost)',
  url: 'https://leetcode.com/problems/minimum-path-cost-in-a-grid/',
  complexity: 'O(m * n^2) time for an m by n grid. The visualization caps the grid at 4 by 4.',
  examples: [
    { label: 'Two rows', input: '{"grid":[[0,1],[2,3]],"move_cost":[[1,1],[1,1],[1,1],[1,1]]}' },
    { label: 'Three rows', input: '{"grid":[[5,3],[4,0],[2,1]],"move_cost":[[9,8],[1,5],[10,12],[18,6],[2,3],[4,1]]}' },
  ],
}

export default function MinimumPathCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.grid} label="Grid" activeCell={step.col >= 0 ? { row: step.row, col: step.col } : null} />
    <MatrixGrid matrix={step.table} label="Cheapest path cost to each cell" activeCell={step.col >= 0 ? { row: step.row, col: step.col } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A path takes one cell per row. Moving from a cell with value v into column c costs move_cost[v][c], and each visited cell adds its own value.</p>
    <p>Only the cheapest arrival into each cell matters for later rows, so the table keeps one number per cell.</p>
  </>} />
}
