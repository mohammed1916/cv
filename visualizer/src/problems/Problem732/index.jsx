import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No bookings; no overlap.' },
    { id: 'add', label: 'Add booking', description: 'Update the start and end markers, then sweep for the peak.' },
    { id: 'done', label: 'Complete', description: 'All bookings processed.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Bookings (JSON array of [start, end))',
  url: 'https://leetcode.com/problems/my-calendar-iii/',
  complexity: 'O(n log n) per booking for this sweep; a lazy segment tree gives O(log n) per booking.',
  examples: [
    { label: 'Growing overlap', input: '[[10,20],[50,60],[10,40],[5,15],[5,10],[25,55]]' },
  ],
}

export default function MyCalendarIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Markers">
      <thead><tr><th>Point</th><th>Change</th></tr></thead>
      <tbody>{step.delta.length === 0 ? <tr><td colSpan={2}>none</td></tr> : step.delta.map(([p, d]) => <tr key={p}><td>{p}</td><td>{d > 0 ? `+${d}` : d}</td></tr>)}</tbody>
    </table>
    <OperationLog title="Maximum overlap after each booking" ops={(step.result ?? []).map((v, i) => ({ name: 'book', args: [i], returned: v }))} current={(step.result ?? []).length - 1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Sweep:</strong> the running total at each point equals the number of bookings covering it, so its maximum is the answer.</p>
  </>} />
}
