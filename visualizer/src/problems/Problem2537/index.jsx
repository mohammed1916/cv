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
    { label: 'Own case 2', input: '{"nums":[4,2,5,4,3,3,5],"k":3}' },
    { label: 'Single zero', input: '{"nums":[0],"k":1}' },
    { label: 'Equal values', input: '{"nums":[2,2,2],"k":3}' },
    { label: 'Largest values for 10 rounds', input: '{"nums":[5,5,5,5,5,5,5,5,5,5,5,5],"k":10}' },
    { label: 'Long run: 12 values, 10 rounds', input: '{"nums":[4,3,1,1,1,1,3,1,5,5,4,2],"k":10}' },
    { label: 'All zeros', input: '{"nums":[0,0,0],"k":4}' },
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
