import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Find the number of distinct values in the whole array.' },
    { id: 'extend', label: 'Extend', description: 'Grow the window on the right until it has every distinct value.' },
    { id: 'count', label: 'Count', description: 'Every end from the window to the array end completes this start.' },
    { id: 'shrink', label: 'Shrink', description: 'Remove the left value before moving to the next start.' },
    { id: 'done', label: 'Complete', description: 'Report the number of complete subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums',
  url: 'https://leetcode.com/problems/count-complete-subarrays-in-an-array/',
  complexity: 'O(n) expected time with a frequency map. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,1,2,2]}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5]}' },
  ],
}

export default function CompleteSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right - 1}
      roleAt={i => (i >= step.left && i < step.right ? 'window' : '')} />
    <output aria-label="Distinct">{`Window ${step.left} to ${step.right - 1} has ${step.distinct} of ${step.target} distinct values. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Once a start has the full set of distinct values at its shortest end, every later end also works, so the count adds in one step.</p>
  </>} />
}
