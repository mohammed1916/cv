import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No prime position is known yet.' },
    { id: 'left', label: 'From left', description: 'Find the first prime.' },
    { id: 'right', label: 'From right', description: 'Find the last prime.' },
    { id: 'done', label: 'Complete', description: 'Report the distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 1 to 100 (JSON), at least one prime',
  url: 'https://leetcode.com/problems/maximum-prime-difference/',
  complexity: 'O(n sqrt(V)) time and O(1) extra space. The visualization caps input at 15 values.',
  examples: [
    { label: 'Example 1', input: '[4,2,9,5,3]' },
    { label: 'Example 2', input: '[4,8,2,8]' },
  ],
}

export default function MaximumPrimeDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (isPrime(run.input[i]) ? 'prime' : '')} active={step.index} />
    <output aria-label="Primes">{`First prime at ${step.first ?? '—'}, last prime at ${step.last ?? '—'}`}</output>
  </>} renderReasoning={() => <>
    <p>The widest pair of primes always uses the first prime from the left and the last prime from the right.</p>
    <p>Any other pair of primes lies inside that span, so it cannot be wider.</p>
  </>} />
}
