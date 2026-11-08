import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase text (JSON object with s)',
  url: 'https://leetcode.com/problems/remove-vowels-from-a-string/',
  complexity: 'O(n) time and O(n) space for n letters.',
  examples: [
    { label: 'Mixed', input: '{"s":"sketching"}' },
    { label: 'Only vowels', input: '{"s":"aeiou"}' },
    { label: 'No vowels', input: '{"s":"rhythm"}' },
    { label: 'Single letter', input: '{"s":"b"}' },
    { label: 'Repeated letters', input: '{"s":"aaaaaaaa"}' },
    { label: 'Long run: 60 letters', input: '{"s":"wjvqmsiathhyicxeesrjjfqfhcrybcigihvctjkpsikfrtroamtmyrpmerdq"}' },
  ],
}

export default function RemoveVowels() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot
      return <>
        <IndexedSequence label="Input" length={run.input.s.length} valueAt={i => run.input.s[i]} active={s.index}
          roleAt={i => (i < s.index ? (run.input.s[i] && 'aeiou'.includes(run.input.s[i]) ? 'skipped' : 'kept') : '')} />
        <p>Output so far: <code>{s.output || '(empty)'}</code></p>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.snapshot.kept === false
      ? 'A vowel makes no change to the output, so the scan simply moves on.'
      : 'Each letter is decided on its own, and survivors keep their original order.'}</p>} />
}
