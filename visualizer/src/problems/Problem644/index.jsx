import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bracket the answer', description: 'The answer lies between the smallest and largest value.' },
    { id: 'check', label: 'Test a guess', description: 'Ask whether a subarray of length at least k reaches the guessed average.' },
    { id: 'done', label: 'Complete', description: 'Report the highest feasible average.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and minimum length (JSON)',
  url: 'https://leetcode.com/problems/maximum-average-subarray-ii/',
  complexity: 'O(n log(range / precision)) time with prefix sums. The visualization caps input at 30 values and runs a fixed 40 iterations.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,12,-5,-6,50,3],"k":4}' },
    { label: 'Single value', input: '{"nums":[5],"k":1}' },
  ],
}

export default function MaximumAverageSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.nums.length} valueAt={i => run.nums[i]} />
    <output aria-label="Search range">
      {`Answer range [${step.lo.toFixed(4)}, ${step.hi.toFixed(4)}]`}
      {step.mid !== null && `, testing average ${step.mid.toFixed(4)}: ${step.feasible ? 'reachable' : 'not reachable'}`}
    </output>
  </>} renderReasoning={() => <>
    <p>The average of a subarray is at least a guess g exactly when the values minus g have a non-negative sum over that subarray. Prefix sums of the shifted values give that test in linear time.</p>
    <p>Each step halves the range of possible averages. The highest guess that passes is the answer.</p>
  </>} />
}
