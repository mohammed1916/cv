import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start the count and copy the number.' },
    { id: 'scan', label: 'Digit', description: 'Read the last digit of the copy.' },
    { id: 'check', label: 'Divides?', description: 'Check whether the digit leaves remainder 0.' },
    { id: 'update', label: 'Update', description: 'Count the digit and drop it from the copy.' },
    { id: 'done', label: 'Result', description: 'Return the count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Number object (JSON, e.g. {"num": 121})',
  url: 'https://leetcode.com/problems/count-the-digits-that-divide-a-number/',
  complexity: 'O(log num) time and O(1) space. The visualization accepts num up to 10^9 without zero digits.',
  examples: [
    { label: 'Single digit', input: '{"num": 7}' },
    { label: 'Repeated digit', input: '{"num": 121}' },
    { label: 'All digits divide', input: '{"num": 1248}' },
  ],
}

export default function CountDigitsThatDivide() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Digits read from the right"
            length={step.digits.length}
            active={step.digitIndex}
            valueAt={(i) => step.digits[i]}
            roleAt={(i) => (i < step.digitIndex ? 'read' : '')}
          />
          <output aria-label="Digit count so far">Count: {step.count} for {run.input.num}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
