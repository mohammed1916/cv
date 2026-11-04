import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'build', label: 'Write', description: 'Write n, then 2n, then 3n one after another.' },
    { id: 'sort', label: 'Sort', description: 'Sort the digits of the joined text.' },
    { id: 'join', label: 'Compare', description: 'Compare the sorted digits with 1 to 9.' },
    { id: 'done', label: 'Result', description: 'Fascinating when the digits are exactly 1 to 9, each once.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (an integer from 100 to 999)',
  url: 'https://leetcode.com/problems/check-if-the-number-is-fascinating/',
  complexity: 'O(1) for three-digit numbers. The check touches nine digit slots at most.',
  examples: [
    { label: 'Three-digit check', input: '{"n":192}' },
    { label: 'Not fascinating', input: '{"n":100}' },
  ],
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function FascinatingNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    // The joined text is shown in three blocks: n, then 2n, then 3n. Below it, each digit 1 to 9 is ticked when present once.
    const n = run.input.n
    const parts = [String(n), String(2 * n), String(3 * n)]
    const text = step.text ?? ''
    const counts = Object.fromEntries(DIGITS.map(d => [d, [...text].filter(ch => ch === String(d)).length]))
    return <section aria-label="Joined digits" style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {parts.map((p, i) => <div key={i} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
          <small style={{ color: 'var(--text-muted)' }}>{['n', '2n', '3n'][i]}</small><div><code>{p}</code></div></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
        {DIGITS.map(d => <div key={d} style={{ textAlign: 'center', padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text)', background: counts[d] === 1 ? 'var(--primary-glow)' : 'var(--surface)' }}>
          <div>{d}</div><small>{counts[d]}×</small></div>)}
      </div>
      <p style={{ margin: 0, color: 'var(--text)' }}>{step.message}</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
