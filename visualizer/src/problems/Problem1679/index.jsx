import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n) expected time and O(n) space: one pass with counts of numbers still waiting for a partner.',
  examples: [
    { label: 'Mixed', input: '{"nums":[1,1,2,4,5,7],"k":8}' },
    { label: 'Repeated pairs', input: '{"nums":[3,1,3,1,3,1],"k":4}' },
    { label: 'No partners', input: '{"nums":[2,2,9],"k":5}' },
  ],
}

const cell = (state) => ({
  minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
  borderRadius: 8, border: `2px solid ${state === 'current' ? 'var(--primary)' : state === 'used' ? 'var(--border)' : 'transparent'}`,
  background: state === 'current' ? 'var(--primary)' : state === 'used' ? 'var(--surface2)' : 'var(--surface)',
  color: state === 'current' ? 'var(--on-primary, #fff)' : 'var(--text)',
})

export default function MaxKSumPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, need, pairs, counts, outcome } = step.snapshot
    const k = run.input.k
    return <>
      <p style={{ margin: '0 0 6px' }}>Target sum <strong>{k}</strong>. Each value needs a partner equal to {k} minus itself.</p>
      <div role="img" aria-label="Numbers in order" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {run.input.nums.map((v, i) => {
          const state = i === index ? 'current' : (index !== null && i < index) || (index === null && step.phase === 'done') ? 'used' : 'ahead'
          return <div key={i} data-index={i} style={cell(state)}>
            <div>{v}</div><small>{i}</small>
            {i === index && <div style={{ fontSize: 11 }}>{outcome === 'paired' ? 'paired' : outcome === 'waiting' ? 'waits' : 'now'}</div>}
          </div>
        })}
      </div>
      <p>{need === null ? 'Scan the numbers from left to right.' : `Current value ${value} looks for a waiting ${need}.`}</p>
      <div aria-label="Waiting pool" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span>Waiting:</span>
        {counts.length === 0 && <span style={{ color: 'var(--text-muted, var(--text))' }}>nothing waiting</span>}
        {counts.map(entry => <span key={entry.value} style={{
          padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border)', background: entry.value === need ? 'var(--primary)' : 'var(--surface2)',
          color: entry.value === need ? 'var(--on-primary, #fff)' : 'var(--text)', fontFamily: 'monospace',
        }}>{entry.value} × {entry.count}</span>)}
      </div>
      <output aria-label="Operations so far" style={{ display: 'block', marginTop: 12 }}>Operations: <strong>{pairs}</strong></output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Pair on arrival:</strong> a value can only pair with a partner that is already waiting, so the scan decides each number once.</p>
    <p><strong>Why counts are enough:</strong> the order of pairing does not change how many pairs exist, so a map of waiting counts answers every lookup.</p>
  </>} />
}
