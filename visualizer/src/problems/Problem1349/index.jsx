import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty row', description: 'Start with an empty row above the hall, which clashes with no seating.' },
    { id: 'row', label: 'Next row', description: 'Consider the seatings of this row that use working seats.' },
    { id: 'mask', label: 'Seating', description: 'Score one seating: its students plus the best compatible total above.' },
    { id: 'done', label: 'Complete', description: 'Report the largest total over the last row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Seats (JSON object with seats as rows of . (working) and # (broken))',
  url: 'https://leetcode.com/problems/maximum-students-taking-exam/',
  complexity: 'O(rows * 4^cols) time with one bitmask per seating. The visualization caps the hall at 5 rows and 4 columns.',
  examples: [
    { label: 'Two rows', input: '{"seats":[".#..","#..#"]}' },
    { label: 'Full hall', input: '{"seats":["....","....","...."]}' },
  ],
}

export default function MaximumStudents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cols = run.seats[0].length
    return <>
      <DPTable title="best[seating]: students seated so far" values={[step.dp]} rowLabels={['best']}
        columnLabels={step.dp.map((_, mask) => mask.toString(2).padStart(cols, '0'))}
        activeCell={step.mask === null ? null : { row: 0, column: step.mask }} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each row is a bitmask. A seating is valid when it uses working seats and no two students sit side by side.</p>
    <p>A student sees the seats upper-left and upper-right, so a seating can follow only those seatings above that leave both diagonals empty.</p>
  </>} />
}
