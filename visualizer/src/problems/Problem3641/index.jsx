import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SemiWindowView from './SemiWindowView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  number: '3641',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[1,2,1,3,3,3,2],"k":1})',
  url: 'https://leetcode.com/problems/longest-semi-repeating-subarray/',
  complexity: 'O(n) time and O(n) space for n numbers, since each index enters and leaves the window once. The visualization caps nums at 14 values from 0 to 9 and k at 5; the official bounds are not verified here.',
  examples: [
    { label: 'One repeated type allowed', input: '{"nums":[1,2,1,3,3,3,2],"k":1}' },
    { label: 'No repeats allowed', input: '{"nums":[1,2,3,1],"k":0}' },
    { label: 'One value many times', input: '{"nums":[7,7,7,7,7],"k":1}' },
    { label: 'One value', input: '{"nums":[0],"k":0}' },
    { label: 'Repeated pairs', input: '{"nums":[1,1,2,2],"k":0}' },
    { label: 'Largest length and k', input: '{"nums":[9,9,9,9,9,9,9,9,9,9,9,9,9,9],"k":5}' },
    { label: 'Long run: 14 values', input: '{"nums":[4,6,4,0,3,7,7,5,4,2,0,1,8,2],"k":3}' },
  ],
}

export default function Problem3641Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <><IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i === step.window[0] ? 'l' : i === step.window[1] ? 'r' : i > step.window[0] && i < step.window[1] ? 'window' : ''} /><SemiWindowView run={run} step={step} /></>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
