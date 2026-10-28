import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no centered subarrays.' },
    { id: 'extend', label: 'Extend', description: 'Grow the subarray to the right and test its sum.' },
    { id: 'done', label: 'Complete', description: 'Report the number of centered subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/number-of-centered-subarrays/',
  complexity: 'O(n^2) time with a set per start. The visualization caps n at 30.',
  examples: [
    { label: 'Example 1', input: '{"nums":[-1,1,0]}' },
    { label: 'Example 2', input: '{"nums":[2,-3]}' },
  ],
}

export default function NumberOfCenteredSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const roleAt = i => (step.span && i >= step.span[0] && i <= step.span[1] ? (step.centered ? 'centered' : 'window') : '')
    return <IndexedSequence label="Array" length={nums.length} valueAt={i => nums[i]} active={step.span ? step.span[1] : -1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A subarray is centered when its sum equals one of the values inside it, so the check is a set lookup as the subarray grows.</p>
  </>} />
}
