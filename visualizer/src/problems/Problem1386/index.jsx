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
    { label: "One row, no reservations", input: "{\"n\":1,\"reserved_seats\":[]}" },
    { label: "Full row blocks a group", input: "{\"n\":1,\"reserved_seats\":[[1,3]]}" },
    { label: "Largest cinema, eight rows", input: "{\"n\":8,\"reserved_seats\":[]}" },
    { label: "Long run: sixty reservations", input: "{\"n\":8,\"reserved_seats\":[[7,10],[1,10],[7,5],[5,3],[6,9],[5,2],[4,6],[8,4],[2,8],[3,7],[6,7],[6,8],[8,8],[7,1],[5,9],[7,6],[2,7],[4,2],[2,3],[2,10],[3,8],[7,8],[4,7],[8,2],[5,8],[3,9],[6,5],[8,6],[7,7],[7,2],[2,2],[1,5],[3,10],[6,2],[8,9],[3,2],[7,4],[1,6],[6,10],[1,4],[1,8],[8,5],[1,1],[8,7],[6,3],[6,1],[2,9],[2,5],[4,8],[4,1],[3,3],[4,10],[5,7],[7,3],[4,5],[2,4],[2,1],[6,6],[3,1],[5,10]]}" },
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
