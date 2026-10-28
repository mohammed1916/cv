import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'No move', description: 'Start with the largest free stretch when nothing moves.' },
    { id: 'move', label: 'Move meeting', description: 'Lift one meeting out and place it in the best gap that fits it.' },
    { id: 'done', label: 'Complete', description: 'Report the longest free stretch.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with eventTime, startTime and endTime',
  url: 'https://leetcode.com/problems/reschedule-meetings-for-maximum-free-time-ii/',
  complexity: 'O(n^2) time for n meetings. The visualization caps input at 8 meetings.',
  examples: [
    { label: 'Example 1', input: '{"eventTime":5,"startTime":[1,3],"endTime":[2,5]}' },
    { label: 'Example 2', input: '{"eventTime":10,"startTime":[0,7,9],"endTime":[1,8,10]}' },
  ],
}

export default function RescheduleMeetings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <table aria-label="Meetings">
        <thead><tr><th>Meeting</th><th>Start</th><th>End</th></tr></thead>
        <tbody>
          {run.input.startTime.map((s, i) => (
            <tr key={i} data-active={step.meeting === i ? 'true' : undefined}>
              <td>{i}</td><td>{s}</td><td>{run.input.endTime[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <output aria-label="Best">{`Longest free stretch so far: ${step.best}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>Removing one meeting merges the free stretches on both sides of it into a single gap.</p>
    <p>The moved meeting fits in any gap at least as long as its duration. Placing it at one end of that gap leaves the rest of the gap free.</p>
  </>} />
}
