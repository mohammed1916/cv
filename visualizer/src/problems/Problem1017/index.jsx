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

// One row per division step: the value, the digit taken off, and the next value.
export default function NegativeBaseVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const current = run.frames.indexOf(step)
      const rows = run.frames.slice(0, current + 1).filter(f => f.phase === 'inspect').map(f => f.snapshot)
      const powers = rows.map((_, i) => `(-2)^${i}`)
      return <section aria-label="Digit state">
        <p style={{ color: 'var(--text)' }}>Current value: {step.snapshot.value ?? step.snapshot.n}</p>
        {rows.length > 0 && <table aria-label="Division steps" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th style={cell}>step</th><th style={cell}>value</th><th style={cell}>digit</th><th style={cell}>place</th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} style={{ background: i === rows.length - 1 ? 'var(--surface2)' : 'transparent' }}>
            <td style={cell}>{i + 1}</td><td style={cell}>{r.value}</td><td style={cell}>{r.bit}</td><td style={cell}>{powers[i]}</td>
          </tr>)}</tbody>
        </table>}
        <p style={{ color: 'var(--text)' }}>Digits from least significant: <code>{step.snapshot.digits.join(' ') || 'none yet'}</code></p>
        {step.snapshot.result !== undefined && <output style={{ color: 'var(--text)' }}>Representation: {step.snapshot.result}</output>}
      </section>
    }}
    renderReasoning={() => <p>Each step removes the digit that makes the remaining value even, then divides by negative two. The division may flip the sign, but every recorded digit stays 0 or 1.</p>} />
}
