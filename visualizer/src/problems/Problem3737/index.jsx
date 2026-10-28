import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Balance', description: 'Start the balance at zero for the empty prefix.' },
    { id: 'end', label: 'End', description: 'Count the earlier prefixes that have a smaller balance.' },
    { id: 'done', label: 'Complete', description: 'Report the number of majority subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums (1 to 12 integers from 0 to 3) and target (0 to 3)',
  url: 'https://leetcode.com/problems/count-subarrays-with-majority-element-i/',
  complexity: 'O(n^2) time for this visualization. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,2,3],"target":2}' },
    { label: 'Example 2', input: '{"nums":[1,1,1,1],"target":2}' },
  ],
}

export default function CountMajoritySubarraysOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => run.input.nums[index] === run.input.target ? 'target' : ''} />
    <output aria-label="Balances">{`Balance after each prefix: ${step.prefix.join(', ')}`}</output>
    <output aria-label="Count">{`Majority subarrays so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Give the target value +1 and every other value -1. A subarray has the target as a strict majority exactly when its balance is positive.</p>
    <p>A subarray balance is the difference of two prefix balances, so each end counts the earlier prefixes that are lower.</p>
  </>} />
}
