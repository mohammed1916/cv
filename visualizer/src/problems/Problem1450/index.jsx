import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1450',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Start, end and query time (JSON)',
  url: 'https://leetcode.com/problems/number-of-students-doing-homework-at-a-given-time/',
  complexity: 'O(n) time and O(1) extra space: one comparison pair per student.',
  examples: [
    { label: 'Shared start', input: '{"start":[1,3,3,8],"end":[3,3,8,10],"query":3}' },
    { label: 'Partial overlap', input: '{"start":[2,5,7,9],"end":[4,6,8,12],"query":6}' },
    { label: 'Too late', input: '{"start":[2,5],"end":[4,6],"query":10}' },
  ],
}

export default function NumberOfStudentsDoingHomework() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { start, end, query, index, count, decided } = step.snapshot
    return <>
      <p>Query time: <strong>{query}</strong> · Busy so far: <strong>{count}</strong></p>
      <div role="list" aria-label="Student intervals" style={{ display: 'grid', gap: 4 }}>
        {start.map((s, i) => {
          const isCurrent = i === index
          const verdict = i < decided.length ? decided[i] : null
          return <div key={i} role="listitem" data-student={i + 1} style={{
            display: 'grid', gridTemplateColumns: '5.5rem 1fr 6rem', gap: 8, alignItems: 'center', fontFamily: 'monospace',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--text)' : 'var(--border)'}`, padding: '4px 6px',
          }}>
            <span>Student {i + 1}</span>
            <span>[{s}, {end[i]}]</span>
            <span>{verdict === null ? 'waiting' : verdict ? 'busy' : 'not busy'}</span>
          </div>
        })}
      </div>
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Closed interval:</strong> a student is busy when start ≤ query ≤ end, so both endpoints count.</p>
  </>} />
}

