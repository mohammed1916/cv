import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1461',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and k (JSON)',
  url: 'https://leetcode.com/problems/check-if-a-string-contains-all-binary-codes-of-size-k/',
  complexity: 'O(n * k) time for a string of length n: each window is built and inserted into a set once.',
  examples: [
    { label: 'All two-bit codes', input: '{"s":"00110110","k":2}' },
    { label: 'Missing 00', input: '{"s":"0110","k":2}' },
    { label: 'Too short', input: '{"s":"0101","k":3}' },
  ],
}

const bar = { height: 12, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }

export default function BinaryCodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, k, needed, windows, start, seen, window } = step.snapshot
    const shown = seen.slice(0, 64)
    return <>
      <div role="img" aria-label="Binary string with the current window" style={{ display: 'flex', gap: 3, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {[...s].map((ch, i) => {
          const inWindow = start !== null && i >= start && i < start + k
          return <span key={i} style={{
            padding: '2px 4px', border: `1px solid ${inWindow ? 'var(--text)' : 'transparent'}`,
            background: inWindow ? 'var(--surface2)' : 'transparent', color: 'inherit', opacity: inWindow ? 1 : 0.6,
          }}>{ch}</span>
        })}
      </div>
      <p>{window ? `Current window: "${window}".` : 'No window is being read.'} Windows available: {windows}. Codes needed: {needed}.</p>
      <div aria-label="Distinct codes seen" style={bar}>
        <div style={{ width: `${Math.min(100, (seen.length / needed) * 100)}%`, height: '100%', background: '#0891b2' }} />
      </div>
      <p>{seen.length} of {needed} distinct codes seen.</p>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {shown.map(code => <span key={code} style={{ padding: '2px 6px', border: '1px solid var(--border)', color: 'inherit' }}>{code}</span>)}
        {seen.length > shown.length && <span>and {seen.length - shown.length} more</span>}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Counting first:</strong> there are exactly 2^k codes, so a string with fewer than 2^k windows cannot contain them all.</p>
    <p><strong>Distinct windows:</strong> a set keeps one copy of each code; the answer is true exactly when the set reaches 2^k members.</p>
  </>} />
}
