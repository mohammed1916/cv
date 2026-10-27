import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Sort the cells by value.' },
    { id: 'group', label: 'Group', description: 'Take every cell that shares the next value.' },
    { id: 'join', label: 'Join', description: 'Link rows and columns that must share a rank.' },
    { id: 'rank', label: 'Rank', description: 'Assign each group its rank.' },
    { id: 'done', label: 'Complete', description: 'Report the rank matrix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix of integers from -100 to 100 as JSON, e.g. {"matrix": [[1,2],[3,4]]}',
  url: 'https://leetcode.com/problems/rank-transform-of-a-matrix/',
  complexity: 'O(m * n log(m * n)) time for the sort plus near-linear union-find work per value group. The visualization caps the matrix at 5 by 5.',
  examples: [
    { label: 'Example 1', input: '{"matrix": [[1,2],[3,4]]}' },
    { label: 'Ties', input: '{"matrix": [[7,7],[7,7]]}' },
  ],
}

const toCell = ([row, col]) => ({ row, col })

export default function RankTransform() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <>
      <MatrixGrid matrix={step.ranks} label="Ranks assigned so far (0 is not yet set)" highlightedCells={step.group.map(toCell)} />
      <output aria-label="Current step">{step.message}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Cells in one row or column keep their order, so a cell must be ranked above every smaller cell that shares its row or column.</p>
      <p>Equal values that are linked through a shared row or column must share one rank, which is why they are joined before ranking.</p>
    </>
  )} />
}
