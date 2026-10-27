import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Top-left', description: 'The top-left cell starts one path with its own value as the XOR.' },
    { id: 'cell', label: 'Cell', description: 'Combine each path count from above and from the left with this cell by XOR.' },
    { id: 'done', label: 'Complete', description: 'Report the paths whose XOR equals k at the bottom-right.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and k (JSON object with grid of integers from 0 to 15, up to 5 by 5, and k from 0 to 15)',
  url: 'https://leetcode.com/problems/count-paths-with-the-given-xor-value/',
  complexity: 'O(m * n * 16) time, since every XOR value stays within 0 to 15. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Official', input: '{"grid":[[2,1,5],[7,10,0],[12,6,4]],"k":11}' },
    { label: 'Single cell', input: '{"grid":[[7]],"k":7}' },
  ],
}

export default function CountPathsXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.grid} label="Grid" activeCell={{ row: step.row, col: step.col }} />
    <MatrixGrid matrix={step.table} label={`Paths to each cell with XOR ${run.k} (· = not yet)`} activeCell={{ row: step.row, col: step.col }} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>XOR is its own inverse, so a path's XOR can be built one cell at a time. Each cell keeps how many paths reach it with each XOR value from 0 to 15.</p>
    <p>A path into a cell comes from above or from the left, and XORing in the cell's value moves each XOR value to a new one.</p>
  </>} />
}
