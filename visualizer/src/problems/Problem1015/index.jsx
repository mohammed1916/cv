import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)', textAlign: 'right' }

// One row per number made of ones: its length and remainder modulo k. A repeated remainder ends the search.
export default function SmallestRepunitVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const current = run.frames.indexOf(step)
      const rows = run.frames.slice(0, current + 1).filter(f => f.phase === 'inspect').map(f => f.snapshot)
      return <section aria-label="Remainder state">
        <p style={{ color: 'var(--text)' }}>k = {step.snapshot.k}. Each row is the number made of {'\u201c'}length{'\u201d'} ones; its remainder is that number mod k.</p>
        <table aria-label="Repunit remainders by length" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th style={cell}>length</th><th style={cell}>remainder mod k</th><th style={cell}>seen before</th></tr></thead>
          <tbody>{rows.map((r, i) => {
            const repeat = rows.slice(0, i).some(p => p.remainder === r.remainder) && r.remainder !== 0
            return <tr key={r.length} style={{ background: i === rows.length - 1 ? 'var(--surface2)' : 'transparent' }}>
              <td style={cell}>{r.length}</td><td style={cell}>{r.remainder}</td><td style={cell}>{repeat ? 'yes, cycle' : r.remainder === 0 ? 'zero: found' : 'no'}</td>
            </tr>
          })}</tbody>
        </table>
        {step.snapshot.result !== undefined && <output style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>Answer: {step.snapshot.result}</output>}
      </section>
    }}
    renderReasoning={() => <p>Only the remainder is kept. Appending a one maps the old remainder to (remainder times 10 plus 1) mod k. A repeated nonzero remainder means the sequence cycles without reaching zero.</p>} />
}
