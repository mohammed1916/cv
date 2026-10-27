import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import SegtreeView from '../../components/shared/SegtreeView'
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

function IntervalViewFor({ run, step }) {
  const shown = run.input.slice(0, step.op === null || step.op === undefined ? 0 : step.op + 1)
  const events = step.delta.map(([pos, delta]) => ({ pos, delta, label: delta > 0 ? 'bookings start' : 'bookings end' }))
  const { interval } = intervalView({
    title: 'Bookings and the sweep over their boundary markers', intervals: shown.map(([start, end], i) => ({ start, end, role: i === shown.length - 1 ? 'current' : 'kept' })),
    events, eventIndex: events.length - 1, note: step.message,
  })
  return interval ? <IntervalView {...interval} /> : null
}

export default function MyCalendarIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IntervalViewFor run={run} step={step} />
    {step.seg && <SegtreeView {...step.seg} />}
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
