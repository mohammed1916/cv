import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SortedBlocksView from './SortedBlocksView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3359',
  phases: [
    { id: 'start', label: 'Setup', description: 'Start the total at zero.' },
    { id: 'run', label: 'Row runs', description: 'Measure each row run from the left column.' },
    { id: 'count', label: 'Count', description: 'Count the blocks of rows with this width.' },
    { id: 'stop', label: 'Stop', description: 'A zero-width row ends this top row.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (rows of integers 0 to 9) and k',
  url: 'https://leetcode.com/problems/find-sorted-submatrices-with-maximum-element-at-most-k/',
  complexity: 'O(m * n^2) time for an n-row, m-column grid, and O(n) extra space per left column. Reading used here: rows of the submatrix must be non-increasing left to right, with no vertical sorting. The visualization caps the grid at 6 by 6 with values 0 to 9.',
  examples: [
    { label: 'Three by three', input: '{"grid":[[3,2,1],[5,2,2],[1,1,4]],"k":3}' },
    { label: 'Ragged tops', input: '{"grid":[[9,8,7,2],[3,3,1,1],[2,4,2,0]],"k":3}' },
  ],
}

export default function SortedSubmatrices() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SortedBlocksView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>For each left column, a row contributes a run of columns that stays at most k and non-increasing. A block of rows can use only the smallest run in it, so the block count is that minimum at each step.</p>
          <p>{step.phase === 'count' ? `This block adds ${step.smallest} submatrices.` : step.message}</p>
        </>
      )}
    />
  )
}
