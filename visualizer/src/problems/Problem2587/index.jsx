import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the numbers from largest to smallest.' },
    { id: 'count', label: 'Positive', description: 'The running sum is positive, so this prefix scores.' },
    { id: 'add', label: 'Not positive', description: 'The running sum is not positive, so this prefix does not score.' },
    { id: 'done', label: 'Complete', description: 'Report the number of positive prefix sums.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums: 1 to 12 integers from -10 to 10',
  url: 'https://leetcode.com/problems/rearrange-array-to-maximize-prefix-score/',
  complexity: 'O(n log n) time for n numbers. The visualization caps the array at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,-1,0,1,-3,3,-3]}' },
    { label: 'Example 2', input: '{"nums":[-2,-3,0]}' },
  ],
}

export default function PrefixScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Running sum">{`Running sum: ${step.total}; positive prefixes: ${step.score}`}</output>
  </>} renderReasoning={() => <>
    <p>Placing the largest numbers first makes the running sum as large as possible at every prefix.</p>
    <p>Once the sum is as large as it can be at each step, counting the positive prefixes is direct, so the sorted order is optimal.</p>
  </>} />
}
