import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Convert', description: 'Turn each time into minutes after midnight.' },
    { id: 'compare', label: 'Compare', description: 'Check whether one event starts no later than the other one ends.' },
    { id: 'done', label: 'Complete', description: 'Report whether the two events share a minute.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with event1 and event2 as ["HH:MM", "HH:MM"]',
  url: 'https://leetcode.com/problems/determine-if-two-events-have-conflict/',
  complexity: 'O(1) time and space.',
  examples: [
    { label: 'Shared minute', input: '{"event1":["01:15","02:00"],"event2":["02:00","03:00"]}' },
    { label: 'Apart', input: '{"event1":["10:00","11:00"],"event2":["14:00","15:00"]}' },
  ],
}

const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export default function EventConflict() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [s1, e1, s2, e2] = step.minutes
    return <>
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
