import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2030',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 's, k, letter and repetition (JSON)',
  url: 'https://leetcode.com/problems/smallest-k-length-subsequence-with-occurrences-of-a-letter/',
  complexity: 'O(k * n * 26) time in this greedy: for each answer position, try letters in order.',
  examples: [
    { label: 'Two copies', input: '{"s":"hello","k":3,"letter":"l","repetition":2}' },
    { label: 'Second letter', input: '{"s":"banana","k":3,"letter":"a","repetition":1}' },
    { label: 'All same', input: '{"s":"zzz","k":2,"letter":"z","repetition":2}' },
  ],
}

export default function SmallestKLengthSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, k, letter, repetition, answer, prev, j, ch, picked } = step.snapshot
    return <>
      <IndexedBar s={s} prev={prev} j={j} />
      <p>Answer so far: <strong>{answer.join('') || '(empty)'}</strong> of length {answer.length} out of {k}. Copies of <strong>{letter}</strong> chosen: <strong>{picked}</strong> of {repetition} needed.</p>
      {ch && <p>Latest pick: <strong>{ch}</strong> at index <strong>{j}</strong>.</p>}
    </>
  }} renderReasoning={() => <p>For each answer position the smallest letter that still allows a valid completion is taken at its earliest position. A completion is valid when enough characters and enough copies of the required letter remain after it.</p>} />
}

function IndexedBar({ s, prev, j }) {
  return <div aria-label="Source string" style={{ display: 'flex', gap: 4, fontFamily: 'monospace' }}>
    {[...s].map((c, i) => <span key={i} style={{
      border: `${i === j ? 2 : 1}px solid ${i === j ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 4, padding: '2px 6px', color: 'var(--text)',
      background: i <= prev ? 'var(--surface2)' : 'transparent',
    }}>{c}</span>)}
  </div>
}
