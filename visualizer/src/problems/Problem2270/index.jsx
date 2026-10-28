import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Find the total and start with an empty left side.' },
    { id: 'split', label: 'Split', description: 'Move one more value to the left and compare the sides.' },
    { id: 'done', label: 'Complete', description: 'Report the number of valid splits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a nums array',
  url: 'https://leetcode.com/problems/number-of-ways-to-split-array/',
  complexity: 'O(n) time and O(1) extra space with a running prefix sum. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[10,4,-8,7]}' },
    { label: 'Example 2', input: '{"nums":[2,3,1,0]}' },
  ],
}

export default function SplitArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.index}
        roleAt={i => (step.index >= 0 && i <= step.index ? 'left' : 'right')} />
      <output aria-label="Split sums">{`Left ${step.left}, right ${step.right}, valid splits ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The left side is a running prefix sum. The right side is the total minus that prefix, so no second pass over the array is needed.</p>
    <p>A split is valid when the left sum is at least the right sum. The last index cannot be a split point because the right side would be empty.</p>
  </>} />
}
