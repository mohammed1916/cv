import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Add up every number once to get the total.' },
    { id: 'scan', label: 'Scan', description: 'Compare the left sum and right sum at each index.' },
    { id: 'done', label: 'Complete', description: 'Every index has its absolute difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums: 1 to 12 integers from 1 to 20',
  url: 'https://leetcode.com/problems/left-and-right-sum-differences/',
  complexity: 'O(n) time and O(n) space. The visualization caps the array at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[10,4,8,3]}' },
    { label: 'Single', input: '{"nums":[1]}' },
  ],
}

export default function LeftRightSumDifferences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => step.index < 0 ? '' : index < step.index ? 'left' : index > step.index ? 'right' : ''} />
    <output aria-label="Left sum">{`Left sum ${step.left ?? 0}, right sum ${step.right ?? 0}`}</output>
    <output aria-label="Answer so far">{`Answer so far: ${step.answer.length ? step.answer.join(', ') : '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>The right sum at index i is the total minus the left sum minus nums[i], so one running total is enough.</p>
    <p>Each index moves the left sum forward once, which keeps the whole pass linear.</p>
  </>} />
}
