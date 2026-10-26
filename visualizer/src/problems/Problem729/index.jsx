import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No bookings yet.' },
    { id: 'accept', label: 'Accept', description: 'The new interval overlaps nothing.' },
    { id: 'reject', label: 'Reject', description: 'The new interval overlaps a booking.' },
    { id: 'done', label: 'Complete', description: 'All bookings processed.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Bookings (JSON array of [start, end))',
  url: 'https://leetcode.com/problems/my-calendar-i/',
  complexity: 'O(n) per booking for this list scan; a balanced ordered set gives O(log n).',
  examples: [
    { label: 'One clash', input: '[[10,20],[15,25],[20,30]]' },
    { label: 'Touching ends', input: '[[1,2],[2,3],[3,4],[1,3]]' },
  ],
}

export default function MyCalendarI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
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
