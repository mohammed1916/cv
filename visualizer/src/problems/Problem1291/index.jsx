import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RangeTrackView from './RangeTrackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1291',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Range object with low and high (JSON)',
  url: 'https://leetcode.com/problems/sequential-digits/',
  complexity: 'O(1) candidate count per length: at most 45 candidates are built for values up to 10^9.',
  examples: [
    { label: 'Three-digit range', input: '{"low":200,"high":400}' },
    { label: 'Mixed lengths', input: '{"low":2000,"high":4500}' },
    { label: 'Empty range', input: '{"low":90,"high":99}' },
  ],
}

export default function SequentialDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { length, start, value, verdict, answer, low, high } = step.snapshot
    return <>
      <RangeTrackView low={low} high={high} value={value} verdict={verdict} answer={answer} />
      <p>Range: {low} to {high}. {length === null ? 'Candidates not started.' : `Length ${length}${start !== null ? `, first digit ${start}` : ''}.`}</p>
      {value !== null && <div role="img" aria-label="Candidate digits" style={{ display: 'flex', gap: 4 }}>
        {String(value).split('').map((d, i) => <div key={i} style={{
          width: 36, textAlign: 'center', fontFamily: 'monospace', padding: '6px 0', boxSizing: 'border-box',
          border: '1px solid var(--border)', background: verdict === 'in' ? 'color-mix(in srgb, var(--success) 30%, var(--surface))' : verdict ? 'color-mix(in srgb, var(--error) 30%, var(--surface))' : 'transparent', color: 'var(--text)',
        }}>{d}</div>)}
      </div>}
      <p>{verdict ? (verdict === 'in' ? 'Inside the range: kept.' : `Outside the range (${verdict}): skipped.`) : ' '}</p>
      <p>Answer so far: {answer.length === 0 ? 'empty' : answer.join(', ')}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Enumerate, do not scan:</strong> there are only 45 possible digit runs at most, so the algorithm builds each run directly rather than testing every integer in the range.</p>
    <p><strong>Sorted by construction:</strong> shorter lengths come first and, within a length, smaller starting digits come first.</p>
  </>} />
}
