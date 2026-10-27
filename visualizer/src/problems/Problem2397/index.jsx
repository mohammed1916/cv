import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best count to zero.' },
    { id: 'choice', label: 'Column choice', description: 'Count the rows covered by this choice of columns.' },
    { id: 'done', label: 'Complete', description: 'Report the largest count over all choices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary matrix and number of columns to choose (JSON object with matrix and num_select)',
  url: 'https://leetcode.com/problems/maximum-rows-covered-by-columns/',
  complexity: 'O(2^n * m) time for an m by n matrix. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Official', input: '{"matrix":[[0,0,0],[1,0,1],[0,1,1],[0,0,1]],"num_select":2}' },
    { label: 'Single column', input: '{"matrix":[[1],[0]],"num_select":1}' },
  ],
}

export default function MaxRowsCovered() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const chosen = []
    for (let c = 0; c < run.matrix[0].length; c++) {
      if ((step.mask >> c) & 1) for (let r = 0; r < run.matrix.length; r++) chosen.push({ row: r, col: c })
    }
    return <>
      <MatrixGrid matrix={run.matrix} label="Matrix (highlighted columns are chosen)" highlightedCells={chosen} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A row is covered when every column holding a 1 in that row is chosen. A row of zeros is covered by any choice.</p>
    <p>There are few enough column choices to try them all, using a bitmask for each choice, and keep the best count.</p>
  </>} />
}
