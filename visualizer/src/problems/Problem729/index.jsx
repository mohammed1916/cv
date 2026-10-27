import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No bookings yet.' },
    { id: 'accept', label: 'Accept', description: 'The new interval overlaps nothing.' },
    { id: 'reject', label: 'Reject', description: 'The new interval overlaps a booking.' },
    { id: 'done', label: 'Complete', description: 'All bookings processed.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Bookings (JSON array of [start, end))',
  url: 'https://leetcode.com/problems/my-calendar-i/',
  complexity: 'O(n) per booking for this list scan; a balanced ordered set gives O(log n).',
  examples: [
    { label: 'One clash', input: '[[10,20],[15,25],[20,30]]' },
    { label: 'Touching ends', input: '[[1,2],[2,3],[3,4],[1,3]]' },
  ],
}

function IntervalViewFor({ step }) {
  const rejected = step.phase === 'reject'
  const booked = step.booked.map(([start, end], i) => ({ start, end, group: 'Calendar', role: !rejected && step.phase === 'accept' && i === step.booked.length - 1 ? 'current' : step.clash && step.clash[0] === start && step.clash[1] === end ? 'active' : 'kept' }))
  const attempt = rejected ? [{ start: step.attempt[0], end: step.attempt[1], group: 'New booking', role: 'rejected', label: 'overlaps, refused' }] : []
  const { interval } = intervalView({ title: 'Bookings on a time line (half-open: touching ends are allowed)', intervals: [...booked, ...attempt], note: step.message })
  return interval ? <IntervalView {...interval} /> : null
}

export default function MyCalendarI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IntervalViewFor step={step} />
    <table aria-label="Booked intervals">
      <thead><tr><th>Booked</th></tr></thead>
      <tbody>{step.booked.length === 0 ? <tr><td>none</td></tr> : step.booked.map(([a, b]) => <tr key={`${a}-${b}`}><td>[{a}, {b})</td></tr>)}</tbody>
    </table>
    <output aria-label="Attempt">{step.attempt ? `Attempt [${step.attempt[0]}, ${step.attempt[1]}) → ${step.phase === 'reject' ? 'rejected' : 'accepted'}` : 'Ready'}</output>
    {step.result && <OperationLog title="Results" ops={step.result.map((ok, i) => ({ name: 'book', args: [i], returned: ok }))} current={step.result.length - 1} />}
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Touching ends:</strong> [1, 2) and [2, 3) share only the point 2, so both are accepted.</p>
  </>} />
}
