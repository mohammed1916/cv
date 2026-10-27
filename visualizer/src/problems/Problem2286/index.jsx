import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import SegtreeView from '../../components/shared/SegtreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Every row is free.' },
    { id: 'gather', label: 'Gather', description: 'Find the first row with k seats in a row, then book them.' },
    { id: 'scatter', label: 'Scatter', description: 'Book any k seats from the smallest rows.' },
    { id: 'reject', label: 'Rejected', description: 'The request cannot be booked.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": rows 1-4, "m": seats 1-6, "ops": [["gather" or "scatter", k, maxRow], ...]}',
  url: 'https://leetcode.com/problems/booking-concert-tickets-in-groups/',
  complexity: 'O(log n) tree work per operation plus O(m) to scan one row. The visualization caps the hall at 4 rows by 6 seats.',
  examples: [
    { label: 'Example', input: '{"n":2,"m":5,"ops":[["gather",4,0],["gather",2,0],["scatter",5,1],["scatter",5,1]]}' },
  ],
}

export default function BookingConcertTickets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid matrix={step.seats.map(row => row.map(t => (t ? 1 : 0)))} label="Seats (1 is booked)" />
    <SegtreeView {...step.seg} />
    <output aria-label="Result">{step.result === null ? 'No booking yet' : `Result: ${JSON.stringify(step.result)}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A gather request needs k seats in one row, so the tree of longest free runs per row answers "first row with a run of k" by a prefix search.</p>
    <p>A scatter request needs only a total, so the tree of free counts answers it, and seats are taken from the smallest rows first.</p>
  </>} />
}
