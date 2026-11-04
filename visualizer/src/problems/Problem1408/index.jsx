import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1408',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Distinct lowercase words (JSON array)',
  url: 'https://leetcode.com/problems/string-matching-in-an-array/',
  complexity: 'O(n² · L) time for n words of length up to L, using a substring check per pair. O(n) extra space for the answer.',
  examples: [
    { label: 'Nested words', input: '["mass", "as", "hero", "superhero"]' },
    { label: 'No match', input: '["cat", "dog"]' },
    { label: 'Chain', input: '["ab", "abc", "abcd"]' },
  ],
}

const chip = { minWidth: 34, padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

// Result of every pair checked so far: rows are the word being tested, columns the word it may sit inside.
function PairGrid({ run, step }) {
  const words = run.input
  const upto = run.frames.indexOf(step)
  const checked = {}
  for (let k = 0; k <= upto; k++) {
    const f = run.frames[k]
    const s = f.snapshot
    if ((f.phase === 'compare' || f.phase === 'found') && s.i !== null && s.j !== null) checked[`${s.i},${s.j}`] = s.inside ? 'in' : 'no'
  }
  const { i, j } = step.snapshot
  return <table aria-label="Pairs checked" style={{ borderCollapse: 'collapse', marginBottom: 10, color: 'var(--text)' }}>
    <thead><tr><th style={chip}>word \ inside</th>{words.map((w, c) => <th key={c} style={chip}>{w}</th>)}</tr></thead>
    <tbody>{words.map((w, r) => <tr key={r}>
      <th style={chip}>{w}</th>
      {words.map((_, c) => {
        const current = i === r && j === c
        const value = r === c ? '-' : (checked[`${r},${c}`] ?? '')
        return <td key={c} style={{ ...chip, borderWidth: current ? 2 : 1, borderColor: current ? 'var(--primary)' : 'var(--border)', background: value === 'in' ? 'var(--surface2)' : 'transparent' }}>{value}</td>
      })}
    </tr>)}</tbody>
  </table>
}

export default function AlgorithmPage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { answer, i, j, inside } = step.snapshot
    return <>
      <PairGrid run={run} step={step} />
      {i !== null && i !== undefined && j !== null && j !== undefined && (
        <p style={{ color: 'var(--text)' }}>Is <strong>{run.input[i]}</strong> inside <strong>{run.input[j]}</strong>? {inside === undefined ? '...' : inside ? 'Yes' : 'No'}</p>
      )}
      <p style={{ color: 'var(--text)' }}>Answer so far: {answer.length ? answer.map(w => `"${w}"`).join(', ') : 'empty'}</p>
      <p style={{ color: 'var(--text)' }}>A word that is found inside another word stops its row early, so the blank cells after it are never checked.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Pairs, not self:</strong> a word always contains itself, so the comparison must skip the same entry and use a different word.</p>
    <p><strong>Stop early:</strong> one containing word is enough to record a word, so the inner loop stops at the first match.</p>
  </>} />
}
