import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Groups', description: 'Collect the indices that share each value.' },
    { id: 'group', label: 'Walk group', description: 'Walk a group in order, using running sums of positions.' },
    { id: 'done', label: 'Complete', description: 'Report the distance total for every index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums: 1 to 12 integers from 0 to 5',
  url: 'https://leetcode.com/problems/sum-of-distances/',
  complexity: 'O(n) time after grouping, plus O(n) space. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,1,1,2]}' },
    { label: 'Example 2', input: '{"nums":[0,5,3]}' },
  ],
}

export default function SumOfDistances() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => step.group.includes(index) ? 'same value' : ''} />
    <output aria-label="Answer so far">{`Answer so far: ${step.answer.join(', ')}`}</output>
  </>} renderReasoning={() => <>
    <p>Only indices holding the same value add to each other’s distance, so the work is done inside each group.</p>
    <p>Within a sorted group, the distances to the left and right are running sums of positions, so each index needs only constant work.</p>
  </>} />
}
