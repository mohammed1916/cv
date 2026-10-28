import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no best window yet.' },
    { id: 'window', label: 'Window', description: 'Count the inversions inside one window.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest inversion count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/minimum-inversion-count-in-subarrays-of-fixed-length/',
  complexity: 'O(n * k^2) time in this visualization, which compares every pair in each window. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,1,2,5,4],"k":3}' },
    { label: 'Reversed', input: '{"nums":[5,3,2,1],"k":4}' },
  ],
}

export default function MinimumInversionCountInFixedWindows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, k } = run.input
    const roleAt = i => (step.start >= 0 && i >= step.start && i < step.start + k ? 'window' : '')
    return <IndexedSequence label="Array" length={nums.length} valueAt={i => nums[i]} active={step.start >= 0 ? step.start : -1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>An inversion is a pair of positions where the earlier value is larger. Only pairs inside the current window count.</p>
  </>} />
}
