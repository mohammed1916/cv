import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3874View from './Problem3874View'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases: [
    { id: 'start', label: 'Peaks', description: 'Mark every interior index larger than both neighbours.' },
    { id: 'peak', label: 'Next peak', description: 'Look at a peak and its neighbouring peaks.' },
    { id: 'bounds', label: 'Bounds', description: 'Limit the left and right ends for this peak.' },
    { id: 'add', label: 'Count', description: 'Add the pairs of ends that this peak owns.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (digits 0 to 9) and k',
  url: 'https://leetcode.com/problems/valid-subarrays-with-exactly-one-peak/',
  complexity: 'O(n) time and O(n) space: one scan marks the peaks and each peak is handled once with its neighbouring peaks. The visualization caps nums at 14 values.',
  examples: [
    { label: 'Two peaks', input: '{"nums":[1,3,2,4,1,5,0],"k":1}' },
    { label: 'Flat run', input: '{"nums":[2,2,2,2],"k":3}' },
    { label: 'Single value, k zero', input: '{"nums":[7],"k":0}' },
    { label: 'Equal values, k zero', input: '{"nums":[0,0,0],"k":0}' },
    { label: 'Largest values, k at limit', input: '{"nums":[9,9,9,9,9,9,9,9,9,9,9,9,9,9],"k":4}' },
    { label: 'Long run: 14 values', input: '{"nums":[4,3,1,0,1,4,9,3,8,4,2,8,3,4],"k":3}' },
  ],
}

export default function Problem3874Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i === step.left ? 'l' : i === step.right ? 'r' : i === step.cur ? 'peak' : ''} /><Problem3874View run={run} step={step} /></>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A subarray with exactly one peak must sit between the peaks on either side of it, so each peak's count depends only on its neighbours.</p>
  </>} />
}
