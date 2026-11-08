import IndexedSequence from '../../components/shared/IndexedSequence'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First value', description: 'Any value of arr1 from 0 to nums[0] starts a pair.' },
    { id: 'cell', label: 'Next value', description: 'Count the earlier values of arr1 that keep both sequences monotonic.' },
    { id: 'done', label: 'Complete', description: 'Add the ways for every value at the last index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON array of integers)',
  url: 'https://leetcode.com/problems/find-the-count-of-monotonic-pairs-ii/',
  complexity: 'O(n * V^2) time for this trace and O(n * V) space; the Python version uses prefix sums for O(n * V), which suits the larger limits of version II. The visualization caps nums at 6 values from 0 to 6.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,1,3]}' },
    { label: 'Example 2', input: '{"nums":[5,2,5]}' },
    { label: 'Single value', input: '{"nums":[0]}' },
    { label: 'Equal values tie', input: '{"nums":[3,3,3]}' },
    { label: 'Longest allowed input', input: '{"nums":[6,0,6,0,6,0]}' },
  ],
}

export default function MonotonicPairsTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.cell ? step.cell[0] : -1} />
    <DPTable title="Ways by index (rows) and arr1 value (columns)" values={step.table}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Result">{step.phase === 'done' ? `Answer: ${run.result}` : `Index ${step.cell ? step.cell[0] : 0} of ${run.input.nums.length - 1}`}</output>
  </>} renderReasoning={() => <>
    <p>arr1 must not decrease, and arr2 = nums - arr1 must not increase. Together these say the next arr1 value is at least the previous one plus any rise in nums.</p>
    <p>Each cell adds up the ways for every earlier value that is small enough, which is a prefix of the previous row.</p>
  </>} />
}
