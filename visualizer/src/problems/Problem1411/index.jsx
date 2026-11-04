import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1411',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of rows (integer)',
  url: 'https://leetcode.com/problems/number-of-ways-to-paint-n-3-grid/',
  complexity: 'O(n) time and O(1) space: only two category totals are kept from row to row.',
  examples: [
    { label: 'One row', input: '1' },
    { label: 'Two rows', input: '2' },
    { label: 'Five rows', input: '5' },
  ],
}

const cell = { minWidth: 30, padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

// Two row shapes: ABA reuses its first colour in the third column, ABC uses three different colours.
function Pattern({ label, letters }) {
  return <div aria-label={label} style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--text)' }}>
    <small style={{ width: 40 }}>{label}</small>
    {letters.map((l, i) => <span key={i} style={cell}>{l}</span>)}
  </div>
}

export default function AlgorithmPage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const upto = run.frames.indexOf(step)
    const rows = [{ row: 1, aba: 6, abc: 6 }]
    for (let k = 0; k <= upto; k++) {
      const f = run.frames[k]
      if (f.phase === 'update') rows.push({ row: f.snapshot.row, aba: f.snapshot.aba, abc: f.snapshot.abc })
    }
    const latest = rows[rows.length - 1]
    return <>
      <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <Pattern label="ABA" letters={['A', 'B', 'A']} />
        <Pattern label="ABC" letters={['A', 'B', 'C']} />
      </div>
      <table aria-label="Row categories" style={{ borderCollapse: 'collapse', color: 'var(--text)', fontFamily: 'monospace' }}>
        <thead><tr><th style={cell}>row</th><th style={cell}>ABA rows</th><th style={cell}>ABC rows</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} style={{ background: i === rows.length - 1 ? 'var(--surface2)' : 'transparent' }}>
          <td style={cell}>{r.row}</td><td style={cell}>{r.aba}</td><td style={cell}>{r.abc}</td>
        </tr>)}</tbody>
      </table>
      {s.nextAba !== undefined && <p style={{ color: 'var(--text)' }}>Next row: ABA = 3 x {latest.aba} + 2 x {latest.abc} = {s.nextAba}; ABC = 2 x {latest.aba} + 2 x {latest.abc} = {s.nextAbc}.</p>}
      {s.total !== undefined && <p style={{ color: 'var(--text)' }}>Total: {s.total}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Two row categories.</strong> A row either repeats its first color in the third column (ABA) or uses three different colors (ABC). The category is enough to count what can follow it.</p>
    <p><strong>Transitions.</strong> Each category has a fixed number of compatible next rows in each category, so the whole count is a two-number recurrence.</p>
  </>} />
}
