import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Group the reservations by row.' },
    { id: 'empty', label: 'Empty rows', description: 'Each row with no reservations seats two families.' },
    { id: 'row', label: 'Booked row', description: 'Check the seat blocks 2-5, 6-9 and 4-7 in this row.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of families.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Cinema (JSON object with n rows and reserved_seats as [row, seat] pairs)',
  url: 'https://leetcode.com/problems/cinema-seat-allocation/',
  complexity: 'O(n + r) time for r reservations, with constant work per row. The visualization caps the cinema at 8 rows.',
  examples: [
    { label: 'Official', input: '{"n":3,"reserved_seats":[[1,2],[1,3],[1,8],[2,6],[3,1],[3,10]]}' },
    { label: 'Empty', input: '{"n":2,"reserved_seats":[]}' },
  ],
}

export default function CinemaSeatAllocation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const rows = Array.from({ length: run.n }, (_, r) => Array.from({ length: 10 }, (_, s) => (
      (run.reserved_seats.some(([row, seat]) => row === r + 1 && seat === s + 1) ? 'X' : '·')
    )))
    const highlighted = step.phase === 'row' ? Array.from({ length: 10 }, (_, s) => ({ row: step.row - 1, col: s })) : []
    return <>
      <MatrixGrid matrix={rows} label="Seats (X reserved, columns are seats 1 to 10)" highlightedCells={highlighted} showFlatIndices={false} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two families fit in an empty row, using seats 2 to 5 and 6 to 9. A booked row can still hold one family in one of those blocks or in the middle block 4 to 7.</p>
    <p>Each row is a bitmask, so checking a block is one bit test. Rows with no reservations contribute two families each without being visited.</p>
  </>} />
}
