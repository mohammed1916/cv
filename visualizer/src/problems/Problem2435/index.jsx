import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Top-left', description: 'The top-left cell starts one path.' },
    { id: 'cell', label: 'Cell', description: 'Shift the remainder counts from the cells above and to the left by this cell.' },
    { id: 'done', label: 'Complete', description: 'Report the paths whose sum has remainder 0 at the bottom-right.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and k (JSON object with grid of digits 0 to 9, up to 5 by 5, and k from 1 to 10)',
  url: 'https://leetcode.com/problems/paths-in-matrix-whose-sum-is-divisible-by-k/',
  complexity: 'O(m * n * k) time with one count per remainder. The visualization caps the grid at 5 by 5 and k at 10.',
  examples: [
    { label: 'Official', input: '{"grid":[[5,2,4],[3,0,5],[0,7,2]],"k":3}' },
    { label: 'Single cell', input: '{"grid":[[0,0]],"k":5}' },
  ],
}

export default function PathsDivisibleByK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.grid} label="Grid" activeCell={{ row: step.row, col: step.col }} />
    <MatrixGrid matrix={step.table} label={`Paths to each cell with sum divisible by ${run.k} (· = not yet)`} activeCell={{ row: step.row, col: step.col }} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only the remainder of a sum mod k matters for divisibility, so each cell keeps one count per remainder instead of every path.</p>
    <p>A path into a cell comes from above or from the left, and adding the cell's value shifts every remainder the same way.</p>
  </>} />
}
