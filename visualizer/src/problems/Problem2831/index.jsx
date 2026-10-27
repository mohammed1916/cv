import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no best length.' },
    { id: 'group', label: 'Group', description: 'Take the positions of one value.' },
    { id: 'shrink', label: 'Shrink', description: 'Move the left position forward while the deleted gaps cost more than k.' },
    { id: 'record', label: 'Record', description: 'Keep the largest count of this value that fits.' },
    { id: 'done', label: 'Complete', description: 'Report the longest equal subarray.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k',
  url: 'https://leetcode.com/problems/find-the-longest-equal-subarray/',
  complexity: 'O(n) time after grouping positions, with two pointers per value. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,2,3,1,3],"k":3}' },
    { label: 'Example 2', input: '{"nums":[1,1,2,2,1,1],"k":2}' },
  ],
}

export default function LongestEqualSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.to}
      roleAt={i => (i >= step.from && i <= step.to ? 'window' : (step.value !== null && run.input.nums[i] === step.value ? 'match' : ''))} />
    <output aria-label="Window">{`Value ${step.value ?? 'none'}, window ${step.from} to ${step.to}, best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Within one value, the window from its left position to its right position needs one deletion for every element that is not that value.</p>
  </>} />
}
