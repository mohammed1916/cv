import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with event1 and event2 as ["HH:MM", "HH:MM"]',
  url: 'https://leetcode.com/problems/determine-if-two-events-have-conflict/',
  complexity: 'O(1) time and space.',
  examples: [
    { label: 'Shared minute', input: '{"event1":["01:15","02:00"],"event2":["02:00","03:00"]}' },
    { label: 'Apart', input: '{"event1":["10:00","11:00"],"event2":["14:00","15:00"]}' },
    { label: 'Same minute', input: '{"event1":["09:00","09:00"],"event2":["09:00","09:00"]}' },
    { label: 'Full day edges', input: '{"event1":["00:00","00:00"],"event2":["23:59","23:59"]}' },
    { label: 'Nested events', input: '{"event1":["08:15","17:45"],"event2":["12:00","12:30"]}' },
  ],
}

const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

// Both events drawn on one clock axis (minutes after midnight). The shared span, when there is one, is drawn as a third bar.
function timeline(step) {
  const [s1, e1, s2, e2] = step.minutes
  const overlap = step.first !== null && step.second !== null && step.first && step.second
  const intervals = [
    { start: s1, end: e1, label: `Event 1 ${clock(s1)}–${clock(e1)}`, group: 'Event 1', role: step.phase === 'start' ? 'pending' : 'current' },
    { start: s2, end: e2, label: `Event 2 ${clock(s2)}–${clock(e2)}`, group: 'Event 2', role: step.phase === 'start' ? 'pending' : 'current' },
  ]
  if (overlap) intervals.push({ start: Math.max(s1, s2), end: Math.min(e1, e2), label: 'shared', group: 'Shared', role: 'merged' })
  const { interval } = intervalView({ title: 'Clock time (closed ranges)', intervals, closed: true, note: 'Both ends are included, so an event ending at 02:00 and one starting at 02:00 share that minute.' })
  return interval ? <IntervalView {...interval} /> : null
}

export default function EventConflict() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [s1, e1, s2, e2] = step.minutes
    return <>
      {timeline(step)}
      <table aria-label="Events in minutes">
        <thead><tr><th>Event</th><th>Start</th><th>End</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>{clock(s1)} ({s1})</td><td>{clock(e1)} ({e1})</td></tr>
          <tr><td>2</td><td>{clock(s2)} ({s2})</td><td>{clock(e2)} ({e2})</td></tr>
        </tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
      {run.result !== null && step.phase === 'done' && <output aria-label="Result">{String(run.result)}</output>}
    </>
  }} renderReasoning={() => <>
    <p>Both events include their endpoints. They share a minute exactly when each one starts no later than the other one ends.</p>
  </>} />
}
