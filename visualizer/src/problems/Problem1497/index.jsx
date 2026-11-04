import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1497',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr (even length) and k (JSON)',
  url: 'https://leetcode.com/problems/check-if-array-pairs-are-divisible-by-k/',
  complexity: 'O(n + k) time and O(k) space: one pass counts remainder classes, then one pass checks the classes.',
  examples: [
    { label: 'Sample A', input: '{"arr":[2,4,1,5,3,9],"k":6}' },
    { label: 'Odd self-pair', input: '{"arr":[1,2,3,4],"k":4}' },
    { label: 'Negatives', input: '{"arr":[-1,1,4,-4],"k":3}' },
  ],
}

const GOOD = 'color-mix(in srgb, var(--success) 35%, var(--surface2))'
const BAD = 'color-mix(in srgb, var(--danger, var(--warning)) 40%, var(--surface2))'

export default function PairsDivisibleByK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { counts, index, remainder, partner, ok } = step.snapshot
    const k = run.input.k
    const mod = v => ((v % k) + k) % k
    const cellStyle = { padding: '4px 8px', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--text)' }
    return <>
      <section aria-label="Values with their remainders">
        <h3>Each value joins the class of its remainder</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {run.input.arr.map((value, i) => <div key={i} data-index={i} style={{
            minWidth: 56, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
            border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
            background: i === index ? 'var(--surface2)' : 'transparent',
          }}><div>{value}</div><small>mod {k} = {mod(value)}</small></div>)}
        </div>
      </section>
      <section aria-label="Remainder classes">
        <h3>Remainder classes and their partner classes</h3>
        <table style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead><tr><th style={cellStyle}>class</th>{counts.map((_, r) => <th key={r} style={cellStyle}>{r}</th>)}</tr></thead>
          <tbody>
            <tr><th style={cellStyle}>count</th>{counts.map((c, r) => <td key={r} style={{
              ...cellStyle,
              background: r === remainder || r === partner ? (ok === false ? BAD : GOOD) : 'transparent',
            }}>{c}</td>)}</tr>
            <tr><th style={cellStyle}>partner</th>{counts.map((_, r) => <td key={r} style={cellStyle}>{(k - r) % k}</td>)}</tr>
          </tbody>
        </table>
        <p>Class {remainder ?? '-'} is checked against partner class {partner ?? '-'}. A class that partners with itself needs an even count.</p>
      </section>
    </>
  }} renderReasoning={() => <>
    <p><strong>Pairs by remainder:</strong> two values pair up when their remainders add to k, or when both remainders are 0 (or both are k / 2).</p>
    <p><strong>Why counts are enough:</strong> only how many values share each remainder matters, so each partner pair of classes is compared once.</p>
  </>} />
}
