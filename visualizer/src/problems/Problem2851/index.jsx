import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count rotations', description: 'Find which rotations of s equal t.' },
    { id: 'start', label: 'Start', description: 'Initial counts before any operation.' },
    { id: 'step', label: 'Operation', description: 'Apply one more operation to both counts.' },
    { id: 'done', label: 'Result', description: 'Report the count after k operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, t (equal length) and k (1 to 8)',
  url: 'https://leetcode.com/problems/string-transformation/',
  complexity: 'O(n * k) time with the two-count recurrence, O(n) extra space. The visualization caps n at 6 and k at 8.',
  examples: [
    { label: 'Example', input: '{"s":"abcd","t":"cdab","k":2}' },
    { label: 'Two letters', input: '{"s":"ab","t":"ba","k":1}' },
  ],
}

const cell = { padding: '4px 8px', borderBottom: '1px solid var(--surface2)', color: 'var(--text)', textAlign: 'left' }
const rotate = (s, l) => s.slice(s.length - l) + s.slice(0, s.length - l)

// Rotations of s by l: those that already equal t are the ways p to move s to t in one operation.
function Rotations({ s, t }) {
  const n = s.length
  return <table aria-label="Rotations of s" style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{['suffix length l', 's after one operation', 'equals t?'].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
    <tbody>{Array.from({ length: n }, (_, l) => l).map(l => {
      const r = rotate(s, l)
      return <tr key={l}><td style={cell}>{l}</td><td style={cell}><code>{r}</code></td><td style={cell}>{r === t ? 'yes' : ''}</td></tr>
    })}</tbody>
  </table>
}

export default function StringTransformation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step, }) => {
    const rows = run.frames.filter(f => f.phase === 'start' || f.phase === 'step').filter(f => f.step <= step.step || step.phase === 'done')
    const n = run.input.s.length
    return <>
      <Rotations s={run.input.s} t={run.input.t} />
      <table aria-label="Ways per operation count" style={{ borderCollapse: 'collapse' }}>
        <thead><tr>{['operations', 'sequences at t', 'sequences elsewhere', 'all sequences'].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map(f => <tr key={f.step} data-current={f === step} style={{ background: f === step ? 'var(--surface2)' : 'transparent' }}>
          <td style={cell}>{f.step}</td><td style={cell}>{f.ways}</td><td style={cell}>{f.total - f.ways}</td><td style={cell}>{f.total}</td>
        </tr>)}</tbody>
      </table>
      <p style={{ color: 'var(--text)', margin: 0 }}>{`Each operation: from t there are p - 1 moves that stay at t, and from elsewhere p moves reach t; every state has n - 1 moves in total (n = ${n}).`}</p>
    </>
  }} renderReasoning={() => <>
    <p>Each operation picks a suffix length from 1 to n minus 1, and the string after it is a rotation of s.</p>
    <p>From any state, the number of choices that land on t depends only on whether the state is t, so two counts are enough to track every sequence.</p>
  </>} />
}
