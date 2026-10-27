import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the previous run maximum to zero.' },
    { id: 'group', label: 'Run', description: 'Take the run of neighbours with equal set bit counts.' },
    { id: 'fail', label: 'Blocked', description: 'A run dips below the previous run maximum.' },
    { id: 'done', label: 'Complete', description: 'Every run fits after the previous one.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: 1 to 20 integers from 1 to 255, e.g. {"nums":[8,4,2,30,15]}',
  url: 'https://leetcode.com/problems/find-if-array-can-be-sorted/',
  complexity: 'O(n log V) time and O(1) extra space, where V is the largest value. The visualization caps the input at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[8,4,2,30,15]}' },
    { label: 'Example 2', input: '{"nums":[3,16,8,4,2]}' },
  ],
}

export default function FindIfArrayCanBeSorted() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.start < run.input.nums.length ? step.start : -1}
      roleAt={i => (i >= step.start && i <= step.end ? 'run' : '')} />
    <output aria-label="Run summary">{`Previous run maximum: ${step.previousMax}${step.low === null ? '' : `, this run ${step.low} to ${step.high}`}`}</output>
  </>} renderReasoning={() => <>
    <p>Neighbours with equal set bit counts can be swapped freely, so each such run can be sorted internally.</p>
    <p>The whole array is sortable when each run's smallest value is at least the largest value of the run before it.</p>
  </>} />
}
