import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with remainder zero and an empty answer.' },
    { id: 'digit', label: 'Digit', description: 'Extend the prefix by one digit and record divisibility.' },
    { id: 'done', label: 'Complete', description: 'Return the divisibility array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a digit string word and an integer m (JSON)',
  url: 'https://leetcode.com/problems/find-the-divisibility-array-of-a-string/',
  complexity: 'O(n) time and O(n) space. The visualization caps the string at 30 digits.',
  examples: [
    { label: 'Example 1', input: '{"word":"998244353","m":3}' },
    { label: 'Example 2', input: '{"word":"1010","m":10}' },
  ],
}

export default function DivisibilityArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits and divisibility" length={run.input.word.length}
      valueAt={i => run.input.word[i]} active={Math.max(0, step.index)}
      roleAt={i => (i < step.answer.length ? (step.answer[i] ? 'divisible' : 'not divisible') : '')} />
    <output aria-label="Remainder">{`Remainder of the prefix: ${step.remainder}`}</output>
  </>} renderReasoning={() => <>
    <p>The prefix value is divisible by m exactly when its remainder is zero.</p>
    <p>Appending a digit d maps remainder r to (10r + d) mod m, so no large number is ever built.</p>
  </>} />
}
