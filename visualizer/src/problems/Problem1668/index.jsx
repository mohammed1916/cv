import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1668',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sequence and word (JSON)',
  url: 'https://leetcode.com/problems/maximum-repeating-substring/',
  complexity: 'O(n * m) time in this simple scan, where n is the sequence length and m is the word length, with a string search per count.',
  examples: [
    { label: 'Sample A', input: '{"sequence":"abababcab","word":"ab"}' },
    { label: 'Triple run', input: '{"sequence":"xyzxyzxy","word":"xyz"}' },
    { label: 'No match', input: '{"sequence":"qwerty","word":"zz"}' },
  ],
}

export default function MaximumRepeatingSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { k, candidate, hit } = step.snapshot
    return <>
      <div role="img" aria-label="Sequence" style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, wordBreak: 'break-all' }}>{run.input.sequence}</div>
      <p>Word: <code>{run.input.word}</code></p>
      <p>Count being tried: <strong>{k ?? '-'}</strong></p>
      <p>Candidate: <code>{candidate === null || candidate === undefined ? '-' : (candidate || '(empty)')}</code>
        {hit !== null && hit !== undefined && <> · {hit ? 'appears in the sequence' : 'does not appear'}</>}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Largest first:</strong> a count larger than the sequence length divided by the word length can never fit, so counting down from that bound finds the best count first.</p>
    <p><strong>Stop early:</strong> the first count that appears is the maximum, so the search ends there.</p>
  </>} />
}
