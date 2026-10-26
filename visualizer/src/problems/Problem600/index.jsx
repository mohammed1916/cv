import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Binary form', description: 'Write n in binary.' },
    { id: 'follow', label: 'Follow 0', description: 'Keep the prefix when the bit is 0.' },
    { id: 'choose0', label: 'Place 0 under 1', description: 'Add every valid suffix count.' },
    { id: 'stop', label: 'Stop', description: 'Two adjacent 1s end the scan.' },
    { id: 'self', label: 'Include n', description: 'n itself is valid if the scan completed.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Integer n (JSON)',
  url: 'https://leetcode.com/problems/non-negative-integers-without-consecutive-ones/',
  complexity: 'O(log n) time and O(log n) space for the Fibonacci table.',
  examples: [
    { label: 'Five', input: '5' },
    { label: 'One', input: '1' },
    { label: 'Large', input: '1000000000' },
  ],
}

export default function ConsecutiveOnes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Binary of ${run.input} (most significant first)`} length={run.bits.length} active={step.index ?? -1}
      valueAt={i => run.bits[i]} roleAt={i => (i === step.index && step.bit === 1 ? 'one' : '')} />
    <output aria-label="Running count">Valid so far: {step.count}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Fibonacci counts:</strong> the number of length-k strings with no adjacent 1s is F(k+2). After a 1 bit we must place 0, so the suffix is free to take any valid pattern.</p>
    <p>{run.result !== undefined ? `Result for ${run.input}: ${run.result}.` : ''}</p>
  </>} />
}
