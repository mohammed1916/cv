import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Gaps', description: 'Measure the free time before, between, and after the meetings.' },
    { id: 'window', label: 'Run of moves', description: 'Moving these consecutive meetings merges the gaps around them.' },
    { id: 'done', label: 'Complete', description: 'Report the largest free time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with eventTime, startTime, endTime (in order), and k',
  url: 'https://leetcode.com/problems/reschedule-meetings-for-maximum-free-time-i/',
  complexity: 'O(n * k) windows, each summed in O(k) time. The visualization caps the schedule at 8 meetings.',
  examples: [
    { label: 'Example 1', input: '{"eventTime":5,"startTime":[1,3],"endTime":[2,5],"k":1}' },
    { label: 'Example 2', input: '{"eventTime":10,"startTime":[0,7,9],"endTime":[1,8,10],"k":1}' },
  ],
}

export default function RescheduleMeetings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Free gaps">
      <thead><tr><th>Gap</th><th>Free time</th><th>Role</th></tr></thead>
      <tbody>{step.gaps.map((g, i) => {
        const inWindow = step.from !== null && i >= step.from && i <= step.to + 1
        return <tr key={i} className={inWindow ? 'is-active' : ''}>
          <td>{i}</td><td>{g}</td><td>{inWindow ? 'merged' : ''}</td>
        </tr>
      })}</tbody>
    </table>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Meetings keep their order and their durations. Moving a run of consecutive meetings lets the free time on both sides of the run join into one block.</p>
    <p>The best run is the one whose merged gaps add up to the most, and a run may contain at most k meetings.</p>
  </>} />
}
