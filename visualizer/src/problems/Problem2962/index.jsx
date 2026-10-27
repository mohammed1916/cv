import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Find the largest value in the array.' },
    { id: 'extend', label: 'Extend', description: 'Add the right value and count it if it is the maximum.' },
    { id: 'shrink', label: 'Shrink', description: 'Move the left end while at least k maximums remain.' },
    { id: 'count', label: 'Count', description: 'Every start before the left end qualifies for this right end.' },
    { id: 'done', label: 'Complete', description: 'Report the number of qualifying subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k',
  url: 'https://leetcode.com/problems/count-subarrays-where-max-element-appears-at-least-k-times/',
  complexity: 'O(n) time with a sliding window. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,2,3,3],"k":2}' },
    { label: 'No match', input: '{"nums":[1,4,2,1],"k":3}' },
  ],
}

export default function MaxAppearsAtLeastK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (i >= step.left && i <= step.right ? 'window' : (run.input.nums[i] === step.largest ? 'max' : ''))} />
    <output aria-label="Count">{`Maximum ${step.largest} appears ${step.count} times in the window. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Starts that still hold at least k maximums form a prefix of the window's starts, so each end adds the number of such starts in one step.</p>
  </>} />
}
