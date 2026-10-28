import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the digit total to zero.' },
    { id: 'digit', label: 'Digit', description: 'Take the last digit and add it to the total.' },
    { id: 'done', label: 'Check', description: 'Test whether x is divisible by its digit sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with x from 1 to 100, for example {"x":18}',
  url: 'https://leetcode.com/problems/harshad-number/',
  complexity: 'O(d) time for d digits.',
  examples: [
    { label: 'Harshad', input: '{"x":18}' },
    { label: 'Not Harshad', input: '{"x":23}' },
  ],
}

export default function HarshadNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of x" length={run.digits.length} valueAt={index => run.digits[index]} active={step.digit ?? -1} />
    <output aria-label="Digit sum">{`Digit sum so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A Harshad number is divisible by the sum of its digits. Add the digits first, then test the remainder.</p>
    <p>If the remainder is not zero, the answer is -1.</p>
  </>} />
}
