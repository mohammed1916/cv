import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1433',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with first and second (JSON)',
  url: 'https://leetcode.com/problems/check-if-a-string-can-break-another-string/',
  complexity: 'O(n log n) time for the two sorts, then O(n) for the dominance checks.',
  examples: [
    { label: 'First can break second', input: '{"first":"abc","second":"xya"}' },
    { label: 'Neither breaks', input: '{"first":"abe","second":"acd"}' },
    { label: 'Anagram pair', input: '{"first":"ab","second":"ba"}' },
  ],
}

const cell = { minWidth: 28, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

// Both words sorted, one row each. The comparison walks down the columns; a failing column is marked.
function Row({ label, letters, index, failedAt }) {
  return <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--text)' }}>
    <small style={{ width: 60 }}>{label}</small>
    {letters.map((ch, i) => <span key={i} style={{ ...cell, borderWidth: i === index ? 2 : 1, borderColor: i === failedAt ? 'var(--error)' : i === index ? 'var(--primary)' : 'var(--border)', opacity: index !== null && i > index ? 0.5 : 1 }}>{ch}</span>)}
  </div>
}

export default function CanBreak() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { a, b, direction, index, left, right, failed, result } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted letters of both words" style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <Row label="first" letters={a} index={direction ? index ?? null : null} failedAt={failed ? index : null} />
        <Row label="second" letters={b} index={direction ? index ?? null : null} failedAt={failed ? index : null} />
      </div>
      {direction && <p style={{ color: 'var(--text)' }}>Checking <strong>{direction}</strong>{index !== undefined && index !== null ? `: position ${index}, ${left} against ${right}` : ''}.</p>}
      {failed && <p style={{ color: 'var(--text)' }}>{left} is smaller than {right} here, so this direction fails.</p>}
      {result !== undefined && <p style={{ color: 'var(--text)' }}>Result: <strong>{result ? 'true' : 'false'}</strong></p>}
      <p style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sort, then compare position by position:</strong> the sorted order pairs the smallest letter of one word with the smallest of the other.</p>
    <p><strong>Either direction:</strong> one word breaks the other when every sorted letter of it is at least the matching letter of the other word.</p>
  </>} />
}
