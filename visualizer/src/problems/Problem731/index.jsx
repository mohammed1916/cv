import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No bookings yet.' },
    { id: 'accept', label: 'Accept', description: 'The booking avoids every double-booked span.' },
    { id: 'reject', label: 'Reject', description: 'It would create a triple booking.' },
    { id: 'done', label: 'Complete', description: 'All bookings processed.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Bookings (JSON array of [start, end))',
  url: 'https://leetcode.com/problems/my-calendar-ii/',
  complexity: 'O(n) per booking for this list version; ordered maps give O(log n) plus overlap work.',
  examples: [
    { label: 'Triple refused', input: '[[10,20],[50,60],[10,40],[5,15],[5,10],[25,55]]' },
  ],
}

export default function MyCalendarII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Bookings and double bookings">
      <thead><tr><th>Booked</th><th>Double-booked</th></tr></thead>
      <tbody>{Array.from({ length: Math.max(step.booked.length, step.doubled.length, 1) }, (_, i) => <tr key={i}>
        <td>{step.booked[i] ? `[${step.booked[i][0]}, ${step.booked[i][1]})` : ''}</td>
        <td>{step.doubled[i] ? `[${step.doubled[i][0]}, ${step.doubled[i][1]})` : ''}</td>
      </tr>)}</tbody>
    </table>
    <OperationLog title="Results" ops={(step.result ?? []).map((ok, i) => ({ name: 'book', args: [i], returned: ok }))} current={(step.result ?? []).length - 1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Two layers:</strong> the first layer is every booking; the second layer is each overlap between two bookings, which must never be overlapped again.</p>
  </>} />
}
