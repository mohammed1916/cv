import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a running sum of zero.' },
    { id: 'sum', label: 'Add a prime', description: 'Add the next prime to the running sum.' },
    { id: 'stop', label: 'Stop', description: 'The running sum passed n.' },
    { id: 'done', label: 'Complete', description: 'Report the largest prime running sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Bound (JSON object with n)',
  url: 'https://leetcode.com/problems/largest-prime-from-consecutive-prime-sum/',
  complexity: 'O(sqrt(n) * number of primes added) time. The visualization caps n at 500.',
  examples: [
    { label: 'Example 1', input: '{"n":20}' },
    { label: 'Example 2', input: '{"n":2}' },
  ],
}

export default function LargestPrimeFromConsecutivePrimeSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <IndexedSequence label="Running prime sums" length={step.sums.length} valueAt={i => step.sums[i]}
      active={step.sums.length - 1} roleAt={i => (step.sums[i] === step.best ? 'best' : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The running sums 2, 5, 10, 17, ... grow quickly, so only a few are at most n. The best answer is the largest one that is also prime.</p>
  </>} />
}
