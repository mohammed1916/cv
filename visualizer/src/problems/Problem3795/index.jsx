import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'expand', label: 'Expand', description: 'Add the next value to the window.' },
    { id: 'shrink', label: 'Shrink', description: 'Record the window while its distinct sum is at least k, then shrink it.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest qualifying window, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and target (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/minimum-subarray-length-with-distinct-sum-at-least-k/',
  complexity: 'O(n) time with a hash map of counts. The visualization caps n at 30.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,2,3,1],"k":4}' },
    { label: 'Example 3', input: '{"nums":[5,5,4],"k":5}' },
  ],
}

export default function MinimumSubarrayLengthDistinctSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const roleAt = i => (step.right >= 0 && i >= step.left && i <= step.right ? 'window' : '')
    return <IndexedSequence label="Array" length={nums.length} valueAt={i => nums[i]} active={step.right >= 0 ? step.right : -1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The distinct sum grows as the window widens, so once it reaches k, moving the left end forward is the only way to find a shorter window.</p>
  </>} />
}
