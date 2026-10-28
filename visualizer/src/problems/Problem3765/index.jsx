import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Read the digits of the number.' },
    { id: 'check', label: 'Check piece', description: 'Test one prefix or suffix for primality.' },
    { id: 'done', label: 'Complete', description: 'Report whether every piece is prime.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number (JSON object with num)',
  url: 'https://leetcode.com/problems/complete-prime-number/',
  complexity: 'O(d * sqrt(num)) time for d digits. The visualization caps the value at 10^9.',
  examples: [
    { label: 'Complete', input: '{"num":23}' },
    { label: 'Not complete', input: '{"num":39}' },
    { label: 'Single prime', input: '{"num":7}' },
  ],
}

export default function CompletePrimeNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const digits = String(run.input.num)
    const roleAt = i => (step.span && i >= step.span[0] && i < step.span[1] ? 'piece' : '')
    return <IndexedSequence label="Digits" length={digits.length} valueAt={i => digits[i]} active={step.span ? step.span[0] : -1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A prefix or suffix is read as an integer, so leading zeros in a suffix are dropped.</p>
  </>} />
}
