import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no primes found.' },
    { id: 'prime', label: 'Prime found', description: 'A substring reads as a prime that has not been counted yet.' },
    { id: 'done', label: 'Complete', description: 'Add the three largest distinct primes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, a digit string (JSON)',
  url: 'https://leetcode.com/problems/sum-of-largest-prime-substrings/',
  complexity: 'O(n^2 * sqrt(V)) time for n digits and substring value V. The visualization caps s at 10 digits.',
  examples: [
    { label: 'Example 1', input: '{"s":"12234"}' },
    { label: 'Example 2', input: '{"s":"111"}' },
  ],
}

export default function SumOfLargestPrimeSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits" length={run.input.s.length} valueAt={i => run.input.s[i]} active={-1} />
    <output aria-label="Primes">{`Distinct primes found: ${step.found.join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A set keeps each prime once, so repeated substrings do not inflate the sum.</p>
  </>} />
}
