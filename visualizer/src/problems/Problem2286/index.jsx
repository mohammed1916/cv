import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import SegtreeView from '../../components/shared/SegtreeView'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
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
    { label: 'Own: three by four seats', input: '{"n":3,"m":4,"ops":[["gather",3,0],["scatter",4,1],["gather",2,1]]}' },
    { label: 'Single seat', input: '{"n":1,"m":1,"ops":[["gather",1,0]]}' },
    { label: 'Repeated group request', input: '{"n":2,"m":3,"ops":[["gather",2,1],["gather",2,1]]}' },
    { label: 'Largest hall, eight requests', input: '{"n":4,"m":6,"ops":[["gather",6,3],["scatter",24,3],["gather",3,0],["scatter",1,0],["gather",2,2],["scatter",5,3],["gather",6,0],["scatter",24,2]]}' },
    { label: 'Long run: 8 requests', input: '{"n":4,"m":6,"ops":[["gather",6,0],["gather",1,2],["gather",6,1],["gather",6,0],["gather",3,3],["scatter",15,3],["scatter",1,2],["scatter",18,1]]}' },
  ],
}

export default function BookingConcertTickets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {step.phase === 'search' && <AnswerRangeBar title="Row search (binary search on the first row that has a long enough run)" min={0} max={run.input.n - 1} low={step.lo} high={step.hi} probe={step.probe} verdict={step.verdict} />}
    <MatrixGrid matrix={step.seats.map(row => row.map(t => (t ? 1 : 0)))} label="Seats (1 is booked)" />
    <SegtreeView {...step.seg} />
    <output aria-label="Result">{step.result === null ? 'No booking yet' : `Result: ${JSON.stringify(step.result)}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A gather request needs k seats in one row, so the tree of longest free runs per row answers "first row with a run of k" by a prefix search.</p>
    <p>A scatter request needs only a total, so the tree of free counts answers it, and seats are taken from the smallest rows first.</p>
  </>} />
}
