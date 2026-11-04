import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)', textAlign: 'center' }

// Alignment of the current query: a matched pattern letter, a skipped lowercase letter, or a failing capital.
export default function PatternMatchVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const pattern = step.snapshot.pattern
      const query = step.snapshot.query
      let j = 0
      const marks = query ? [...query].map(ch => {
        if (j < pattern.length && ch === pattern[j]) { j += 1; return 'match' }
        return ch >= 'A' && ch <= 'Z' ? 'fail' : 'skip'
      }) : []
      return <section aria-label="Pattern matching state">
        <p style={{ color: 'var(--text)' }}>Pattern: <code>{pattern}</code></p>
        {query && <table aria-label="Query alignment" style={{ borderCollapse: 'collapse' }}>
          <thead><tr>{[...query].map((ch, i) => <th key={i} style={{ ...cell, borderWidth: i === step.snapshot.index ? 2 : 1 }}>{ch}</th>)}</tr></thead>
          <tbody><tr>{marks.map((m, i) => <td key={i} style={{ ...cell, background: m === 'match' ? 'var(--surface2)' : 'transparent' }}>{m}</td>)}</tr></tbody>
        </table>}
        {step.snapshot.j !== undefined && <p style={{ color: 'var(--text)' }}>Pattern letters matched: <strong>{step.snapshot.j}</strong> of {pattern.length}</p>}
        <p style={{ color: 'var(--text)' }}>Answers so far: <code>{step.snapshot.answer.map(flag => (flag ? 'yes' : 'no')).join(' ') || 'none yet'}</code></p>
      </section>
    }}
    renderReasoning={() => <p>The pattern is consumed in order. A lowercase letter may be skipped as an insertion, but an uppercase letter must match the next pattern letter, otherwise the query fails.</p>} />
}
