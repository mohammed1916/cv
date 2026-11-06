import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1534',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values and three limits (JSON object)',
  url: 'https://leetcode.com/problems/count-good-triplets/',
  complexity: 'O(n^3) time and O(1) extra space: every index triple is checked once. Input is kept small here so the whole run can be followed.',
  examples: [
    { label: 'Mixed', input: '{"arr":[4,2,6,3,8],"a":3,"b":2,"c":4}' },
    { label: 'Single good', input: '{"arr":[1,2,3],"a":1,"b":1,"c":2}' },
    { label: 'All equal', input: '{"arr":[7,7,7,7],"a":0,"b":0,"c":0}' },
  ],
}

export default function CountGoodTriplets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, i, j, k, checks, count } = step.snapshot
    const picked = new Set([i, j, k].filter(v => v !== null && v !== undefined))
    return <>
      <div role="img" aria-label="Values with the current triple highlighted" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((v, idx) => <div key={idx} style={{ width: 48, textAlign: 'center', fontFamily: 'monospace', padding: 6, boxSizing: 'border-box', border: `${picked.has(idx) ? 2 : 1}px solid ${picked.has(idx) ? 'var(--text)' : 'var(--border)'}`, background: picked.has(idx) ? 'var(--surface2)' : 'transparent' }}>
          <div>{v}</div><small>{idx}</small><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', minHeight: 14 }}>{[i === idx && 'i', j === idx && 'j', k === idx && 'k'].filter(Boolean).join(' ')}</div>
        </div>)}
      </div>
      {checks ? <ul>
        <li>{`|arr[i] - arr[j]| <= a: ${checks[0] ? 'holds' : 'fails'}`}</li>
        <li>{`|arr[j] - arr[k]| <= b: ${checks[1] ? 'holds' : 'fails'}`}</li>
        <li>{`|arr[i] - arr[k]| <= c: ${checks[2] ? 'holds' : 'fails'}`}</li>
      </ul> : <p>Waiting for the first triple.</p>}
      <p>Good triples so far: <strong>{count}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Direct check:</strong> the problem fixes the three indices, so every triple can be tested against the three limits independently.</p>
    <p><strong>Why nested loops:</strong> i &lt; j &lt; k is enumerated once per triple, so each unordered choice is counted exactly once.</p>
  </>} />
}
