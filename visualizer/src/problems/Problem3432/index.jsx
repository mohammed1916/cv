import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Add up the whole array.' },
    { id: 'split', label: 'Split', description: 'Move the split one position right and test the difference.' },
    { id: 'done', label: 'Complete', description: 'Report the count of even-difference splits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums: 2 to 12 integers from 1 to 10',
  url: 'https://leetcode.com/problems/count-partitions-with-even-sum-difference/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[10,10,3,7,6]}' },
    { label: 'Example 2', input: '{"nums":[1,2,2]}' },
  ],
}

export default function CountPartitionsEvenDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => index <= step.index ? 'left' : 'right'} />
    <output aria-label="Sums">{`Left ${step.left}, right ${step.right}`}</output>
    <output aria-label="Count">{`Even-difference splits: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>The difference between the left and right sums is even exactly when the two sums have the same parity.</p>
    <p>Moving the split one position at a time keeps a running left sum, and the right sum is the total minus it.</p>
  </>} />
}
