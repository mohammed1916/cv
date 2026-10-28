import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prefix sums are ready.' },
    { id: 'scan', label: 'Left end', description: 'Find the valid range of middle ends for this left end.' },
    { id: 'done', label: 'Complete', description: 'Report the count modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON)',
  url: 'https://leetcode.com/problems/ways-to-split-array-into-three-subarrays/',
  complexity: 'O(n log n) time and O(n) space for the prefix sums.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,1]}' },
    { label: 'Example 2', input: '{"nums":[1,2,2,2,5,0]}' },
  ],
}

export default function ThreeSplits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.nums.length} active={step.i}
      valueAt={index => run.nums[index]}
      roleAt={index => (step.lo !== null && index >= step.lo && index <= step.hi ? 'middle end' : '')} />
    <output aria-label="Split count">{`Count so far: ${step.count}${step.i >= 0 ? ` · left part ends before ${step.i}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>With prefix sums, the three sums are determined by two cut points, and the order condition becomes a range of valid middle cuts for each left cut.</p>
    <p>Because the numbers are non-negative, both boundaries of that range are found by binary search over the prefix sums.</p>
  </>} />
}
