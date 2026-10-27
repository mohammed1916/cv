import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the prefix table and the count.' },
    { id: 'cell', label: 'Corner', description: 'Compute the rectangle from the top-left to this corner and compare it with k.' },
    { id: 'done', label: 'Complete', description: 'Report the count of qualifying corners.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and k (JSON)',
  url: 'https://leetcode.com/problems/count-submatrices-with-top-left-element-and-sum-less-than-k/',
  complexity: 'O(m * n) time and space. The visualization caps input at 6 by 6.',
  examples: [
    { label: 'Example', input: '{"grid":[[1,1],[1,1]],"k":2}' },
    { label: 'All zeros', input: '{"grid":[[0,0],[0,0]],"k":0}' },
  ],
}

export default function TopLeftSubmatrices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.input.grid} label="Grid" activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} cellWidth={44} cellHeight={40} />
    <MatrixGrid matrix={step.prefix} label="Prefix sums (rectangle from the top-left corner)" activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} cellWidth={44} cellHeight={40} />
    <output aria-label="Count">{`Count so far: ${step.count} (k = ${run.input.k})`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Any submatrix containing grid[0][0] starts at the top-left corner, so it is identified by its bottom-right corner. Its sum is that corner’s prefix sum, which is built from the three neighbouring prefixes.</p>
  </>} />
}
