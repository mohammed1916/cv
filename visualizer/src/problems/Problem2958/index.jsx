import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty tally.' },
    { id: 'extend', label: 'Extend', description: 'Add the value at the right edge to the tally.' },
    { id: 'shrink', label: 'Shrink', description: 'Remove values from the left until the new value is within the limit.' },
    { id: 'record', label: 'Record', description: 'Keep the longest valid window seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the longest subarray.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/length-of-longest-subarray-with-at-most-k-frequency/',
  complexity: 'O(n) time and O(n) space for the tally. The visualization caps input at 30 values.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[2,3,4,2,3,4,2,3],"k":3}' },
    { label: 'Repeats', input: '{"nums":[1,2,1,2,1,2,1,2],"k":1}' },
    { label: 'One value', input: '{"nums":[4],"k":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"k":2}' },
    { label: 'Upper length', input: '{"nums":[20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1],"k":30}' },
    { label: 'Long run: 30 values', input: '{"nums":[17,17,12,4,2,19,2,1,4,8,10,5,4,20,9,20,10,16,15,2,16,14,15,5,3,14,1,16,5,1],"k":4}' },
  ],
}

export default function LongestAtMostKFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (step.right >= 0 && i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Tally">{`Tally: ${Object.entries(step.counts).map(([v, c]) => `${v}×${c}`).join(', ') || 'empty'}; best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only the value that was just added can exceed the limit, so shrinking the left edge until that value is back within k keeps every window valid.</p>
  </>} />
}
