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

const chip = { padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'monospace', color: 'var(--text)' }

export default function StringMatchingInArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { i, j, answer, inside } = step.snapshot
    return <>
      <div role="img" aria-label="Words in the input" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((word, k) => <div key={k} style={{
          ...chip, borderWidth: k === i ? 2 : 1,
          background: k === j ? 'var(--surface2)' : 'transparent',
        }}>{word}{k === i ? ' (checking)' : ''}{k === j ? ' (inside?)' : ''}</div>)}
      </div>
      {i !== null && i !== undefined && j !== null && j !== undefined && (
        <p>Is <strong>{run.input[i]}</strong> inside <strong>{run.input[j]}</strong>? {inside === undefined ? '…' : inside ? 'Yes' : 'No'}</p>
      )}
      <p>Answer so far: {answer.length ? answer.map(w => `"${w}"`).join(', ') : 'empty'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Pairs, not self:</strong> a word always contains itself, so the comparison must skip the same entry and use a different word.</p>
    <p><strong>Stop early:</strong> one containing word is enough to record a word, so the inner loop stops at the first match.</p>
  </>} />
}
