import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'split', label: 'Groups', description: 'Split the numbers by remainder mod 3.' },
    { id: 'pick', label: 'Candidate', description: 'Test one candidate triple.' },
    { id: 'done', label: 'Complete', description: 'Report the largest valid sum, or 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/maximum-sum-of-three-numbers-divisible-by-three/',
  complexity: 'O(n log n) time for sorting the groups. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,2,3,1]}' },
    { label: 'Example 2', input: '{"nums":[2,1,5]}' },
  ],
}

export default function MaximumSumThreeDivisibleByThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run }) => (
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => `remainder ${run.input.nums[i] % 3}`} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A triple sums to a multiple of 3 only when its remainders are all equal or are 0, 1 and 2, so only those candidates need checking.</p>
  </>} />
}
