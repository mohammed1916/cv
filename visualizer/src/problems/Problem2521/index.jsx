import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty set of primes.' },
    { id: 'value', label: 'Value', description: 'Take the next element.' },
    { id: 'try', label: 'Try', description: 'Test the next possible divisor.' },
    { id: 'factor', label: 'Factor', description: 'Record a prime that divides the element.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 2 to 1000 (JSON)',
  url: 'https://leetcode.com/problems/distinct-prime-factors-of-product-of-array/',
  complexity: 'O(n sqrt(V)) time and O(k) space for k distinct primes. The visualization caps input at 10 values.',
  examples: [
    { label: 'Example 1', input: '[2,4,3,7,10,6]' },
    { label: 'Example 2', input: '[21,4,7]' },
  ],
}

export default function DistinctPrimeFactors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} valueAt={i => run.input[i]} active={step.index} />
    <output aria-label="Primes found">{`Primes so far: ${step.found.length ? step.found.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A prime divides the product exactly when it divides at least one element, so the product itself is never needed.</p>
    <p>Trial division up to the square root removes each element's prime factors; anything left over is a prime.</p>
  </>} />
}
