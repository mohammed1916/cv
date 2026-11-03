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

export default function StringCanBreak() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { first, second } = run.input
    const { a, b, direction, index, left, right, pass, failed, result } = step.snapshot
    const sortedA = a ?? [...first]
    const sortedB = b ?? [...second]
    const cell = (ch, i, side) => <div key={`${side}${i}`} style={{
      minWidth: 36, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
      border: `${index === i ? 2 : 1}px solid ${index === i ? 'var(--text)' : 'var(--border)'}`,
      background: index === i ? (pass ? '#bbf7d0' : '#fecaca') : 'transparent', color: '#1c1917',
    }}>{ch}</div>
    return <>
      <p>Sorted first: <code>{sortedA.join('')}</code> &nbsp; Sorted second: <code>{sortedB.join('')}</code></p>
      <div role="img" aria-label="Sorted letters side by side" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sortedA.map((ch, i) => cell(ch, i, 'a'))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
        {sortedB.map((ch, i) => cell(ch, i, 'b'))}
      </div>
      <p>{direction ? `${direction}${index !== undefined ? `, position ${index}: ${left} vs ${right}` : ''}` : 'No direction tested yet.'}{failed ? ' - fails' : ''}</p>
      {result !== undefined && <p><strong>Result: {String(result)}</strong></p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Sorting first:</strong> sorted letters are the most favourable order for dominance, so a single position-by-position check decides each direction.</p>
    <p><strong>Two directions:</strong> one string may break the other, or the other may break it.</p>
  </>} />
}
