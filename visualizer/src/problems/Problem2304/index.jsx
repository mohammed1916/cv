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
    { label: 'Single cell', input: '{"grid":[[0]],"move_cost":[[3]]}' },
    { label: 'All moves free', input: '{"grid":[[0,1],[2,3]],"move_cost":[[0,0],[0,0],[0,0],[0,0]]}' },
    { label: 'Largest 4 by 4 grid', input: '{"grid":[[15,14,13,12],[11,10,9,8],[7,6,5,4],[3,2,1,0]],"move_cost":[[0,3,6,9],[7,0,3,6],[4,7,0,3],[1,4,7,0],[8,1,4,7],[5,8,1,4],[2,5,8,1],[9,2,5,8],[6,9,2,5],[3,6,9,2],[0,3,6,9],[7,0,3,6],[4,7,0,3],[1,4,7,0],[8,1,4,7],[5,8,1,4]]}' },
    { label: 'Long run: shuffled 4 by 4', input: '{"grid":[[2,4,6,7],[11,9,12,3],[10,13,5,14],[0,1,8,15]],"move_cost":[[4,6,3,6],[1,2,6,0],[7,7,2,3],[9,9,3,0],[0,7,6,7],[5,6,5,8],[8,0,8,8],[1,2,9,5],[8,4,6,3],[8,7,8,8],[8,3,2,8],[8,0,0,0],[1,9,9,2],[9,3,7,4],[6,4,4,3],[4,1,1,1]]}' },
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
