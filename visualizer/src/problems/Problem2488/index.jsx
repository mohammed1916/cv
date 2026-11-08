import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no counted subarrays.' },
    { id: 'check', label: 'Check window', description: 'Sort the window and read its middle element.' },
    { id: 'done', label: 'Complete', description: 'Report how many windows have median k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (a permutation of 1 to n) and k (JSON)',
  url: 'https://leetcode.com/problems/count-subarrays-with-median-k/',
  complexity: 'O(n^2 log n) time for this sorted check. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,2,1,4,5],"k":4}' },
    { label: 'Example 2', input: '{"nums":[1,2,3],"k":2}' },
    { label: 'Single element', input: '{"nums":[1],"k":1}' },
    { label: 'Median in the middle', input: '{"nums":[2,4,1,3],"k":3}' },
    { label: 'Reversed largest permutation', input: '{"nums":[12,11,10,9,8,7,6,5,4,3,2,1],"k":1}' },
    { label: 'Long run: 12 numbers', input: '{"nums":[6,11,12,10,1,4,2,3,8,5,9,7],"k":6}' },
  ],
}

export default function CountSubarraysWithMedianK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (step.left >= 0 && i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Count">{`Counted subarrays: ${step.count} (target median ${run.input.k})`}</output>
  </>} renderReasoning={() => <>
    <p>The median of a window is its sorted middle element, and for an even length it is the larger of the two middle values.</p>
    <p>Trying every start and end position checks each window directly, which is simple to verify on a small array.</p>
  </>} />
}
