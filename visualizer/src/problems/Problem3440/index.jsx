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
    { label: 'Invented short day', input: '{"eventTime":6,"startTime":[0,2],"endTime":[1,4]}' },
    { label: 'Invented three meetings', input: '{"eventTime":10,"startTime":[0,7,9],"endTime":[1,8,10]}' },
    { label: 'Smallest day', input: '{"eventTime":2,"startTime":[0,1],"endTime":[1,2]}' },
    { label: 'Touching meetings tie', input: '{"eventTime":10,"startTime":[0,5],"endTime":[5,10]}' },
    { label: 'Longest day: 30', input: '{"eventTime":30,"startTime":[0,29],"endTime":[1,30]}' },
    { label: 'Long run: 8 meetings', input: '{"eventTime":30,"startTime":[0,4,8,12,16,20,24,28],"endTime":[3,7,11,15,19,23,27,30]}' },
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
      {step.gaps && step.gaps.length > 0 && <ol aria-label="Free stretches without the lifted meeting" style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
        {step.gaps.map((g, j) => {
          const fits = step.dur !== null && g >= step.dur
          const chosen = step.chosen === j
          return <li key={j} data-role={chosen ? 'chosen' : fits ? 'fits' : ''} style={{ minWidth: 64, padding: '0.4rem', textAlign: 'center', borderRadius: 6, border: `2px solid ${chosen ? 'var(--primary)' : fits ? 'var(--text)' : 'var(--surface2)'}`, background: chosen ? 'var(--surface2)' : 'transparent', color: 'var(--text)' }}>
            <small>gap {j}</small><br /><strong>{g}</strong>{fits ? <small> fits</small> : null}
          </li>
        })}
      </ol>}
      <output aria-label="Best">{`Longest free stretch so far: ${step.best}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>Removing one meeting merges the free stretches on both sides of it into a single gap.</p>
    <p>The moved meeting fits in any gap at least as long as its duration. Placing it at one end of that gap leaves the rest of the gap free.</p>
  </>} />
}
