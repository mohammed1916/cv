import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start the total at 0 with a positive sign.' },
    { id: 'scan', label: 'Digit', description: 'Read the next digit from the left.' },
    { id: 'update', label: 'Update', description: 'Add the signed digit and flip the sign.' },
    { id: 'done', label: 'Result', description: 'Return the signed total.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Number object (JSON, e.g. {"n": 521})',
  url: 'https://leetcode.com/problems/alternating-digit-sum/',
  complexity: 'O(d) time and O(d) space for d digits, where d is at most 10. The visualization accepts n up to 10^9.',
  examples: [
    { label: 'Mixed signs', input: '{"n": 521}' },
    { label: 'Repeated digit', input: '{"n": 111}' },
    { label: 'Cancels to zero', input: '{"n": 886996}' },
  ],
}

export default function AlternatingDigitSum() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Digits of n (most significant first)"
            length={step.digits.length}
            active={step.index}
            valueAt={(i) => `${i % 2 === 0 ? '+' : '-'}${step.digits[i]}`}
            roleAt={(i) => (i % 2 === 0 ? 'positive' : 'negative')}
          />
          <output aria-label="Running total">Total: {step.total} for {run.input.n}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
