import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Find the number of distinct values in the whole array.' },
    { id: 'extend', label: 'Extend', description: 'Move r right until the window has every distinct value.' },
    { id: 'count', label: 'Count', description: 'Every end from r to the array end completes this start.' },
    { id: 'shrink', label: 'Shrink', description: 'Move l right before the next start.' },
    { id: 'done', label: 'Complete', description: 'Report the number of complete subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums',
  url: 'https://leetcode.com/problems/count-complete-subarrays-in-an-array/',
  complexity: 'O(n) expected time with a frequency map. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,1,2,3]}' },
    { label: 'Equal values', input: '{"nums":[6,6,6]}' },
  ],
}

export default function CompleteSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values with window l and r" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right - 1}
      roleAt={i => (i === step.left && i < step.right ? 'l' : i === step.right - 1 ? 'r' : i > step.left && i < step.right ? 'window' : '')} />
    <output aria-label="Distinct">{`Window l=${step.left} to r=${step.right - 1} has ${step.distinct} of ${step.target} distinct values. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Once a start has the full set of distinct values, every end from the shortest one to the array end also works, so the count adds in one step.</p>
  </>} />
}
