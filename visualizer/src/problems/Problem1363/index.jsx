import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count each digit and find the digit-sum remainder.' },
    { id: 'drop', label: 'Fix remainder', description: 'Drop the fewest smallest digits that fix the remainder mod 3.' },
    { id: 'build', label: 'Build', description: 'Write the remaining digits from largest to smallest.' },
    { id: 'done', label: 'Result', description: 'Return the number, or 0 for all zeros, or empty if impossible.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Digits (JSON object with digits, e.g. {"digits":[8,1,9]})',
  url: 'https://leetcode.com/problems/largest-multiple-of-three/',
  complexity: 'O(n) time and O(1) extra space for digit counts. The visualization caps input at 50 digits.',
  examples,
}

export default function LargestMultipleOfThree() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="digit counts" length={10} active={step.focus ?? -1}
        valueAt={i => `${i} x ${step.cnt[i]}`} roleAt={i => (step.cnt[i] === 0 ? 'empty' : '')} />
      <p>Remainder mod 3: {step.rem ?? '-'}. Dropped: {step.removed.length ? step.removed.join(', ') : 'none'}.</p>
      {step.result !== null && <p>Result: {step.result === '' ? '(empty)' : step.result}</p>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
