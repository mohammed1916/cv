import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1979',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of positive integers (JSON)',
  url: 'https://leetcode.com/problems/find-greatest-common-divisor-of-array/',
  complexity: 'O(n) time for the scan and O(log max) time for Euclid\'s steps.',
  examples: [
    { label: 'Extremes 2 and 9', input: '[9,4,6,2]' },
    { label: 'Shared divisor 6', input: '[12,30,18,6]' },
    { label: 'Equal values', input: '[9,9,9]' },
  ],
}

export default function FindGreatestCommonDivisorOfArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, index, smallest, largest, minIndex, maxIndex, a, b } = step.snapshot
    return <>
      <IndexedSequence label="Array values" length={nums.length} valueAt={i => nums[i]} active={index}
        roleAt={i => (i === minIndex ? 'smallest' : '') + (i === maxIndex ? ' largest' : '')} />
      <p>Smallest so far: <strong>{smallest ?? '-'}</strong> · Largest so far: <strong>{largest ?? '-'}</strong></p>
      {a !== null && <p>Euclid pair: <strong>({a}, {b})</strong>; the answer is the value that remains when the other reaches zero.</p>}
    </>
  }} renderReasoning={() => <p>The answer depends only on the two extremes. Euclid's rule replaces the pair (a, b) by (b, a mod b) until b is zero.</p>} />
}
