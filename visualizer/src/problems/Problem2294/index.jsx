import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the first group at the smallest value.' },
    { id: 'join', label: 'Join', description: 'The value is within k of the group start.' },
    { id: 'open', label: 'New group', description: 'The value is too far above the group start.' },
    { id: 'done', label: 'Complete', description: 'Report the number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 12 values from 0 to 100) and k (0 to 100)',
  url: 'https://leetcode.com/problems/partition-array-such-that-maximum-difference-is-k/',
  complexity: 'O(n log n) time for n values. The visualization caps values at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,6,1,2,5],"k":2}' },
    { label: 'Equal values', input: '{"nums":[2,2,4,5],"k":0}' },
  ],
}

export default function PartitionByDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={[...run.input.nums].sort((a, b) => a - b).length} valueAt={index => [...run.input.nums].sort((a, b) => a - b)[index]} active={step.value === -1 ? -1 : [...run.input.nums].sort((a, b) => a - b).indexOf(step.value)} />
    <output aria-label="Groups">{`Groups so far: ${step.groups}; current group starts at ${step.start}`}</output>
  </>} renderReasoning={() => <>
    <p>Sorted values let each group be a contiguous run, so the greedy choice is to extend the current group as far as k allows.</p>
    <p>A value that is more than k above the group start cannot join it, and starting a new group there is never worse.</p>
  </>} />
}
