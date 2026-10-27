import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty window and no pairs.' },
    { id: 'extend', label: 'Extend', description: 'Add the right value and the pairs it forms.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop left values while the window keeps at least k pairs.' },
    { id: 'count', label: 'Count', description: 'Every start up to the left end gives a good subarray.' },
    { id: 'done', label: 'Complete', description: 'Report the number of good subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k',
  url: 'https://leetcode.com/problems/count-the-number-of-good-subarrays/',
  complexity: 'O(n) time with a sliding window and a frequency map. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,1,1,1],"k":10}' },
    { label: 'Example 2', input: '{"nums":[3,1,4,3,2,2,4],"k":2}' },
  ],
}

export default function GoodSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Pairs">{`Window ${step.left} to ${step.right} has ${step.pairs} equal pairs. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Removing a value from the left drops its equal pairs, so the left end moves only while at least k pairs remain.</p>
  </>} />
}
