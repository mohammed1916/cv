import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowModeView from './WindowModeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3672',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[1,2,2,3,3,3],"k":2})',
  url: 'https://leetcode.com/problems/sum-of-weighted-modes-in-subarrays/',
  complexity: 'O(n × k) time and O(k) space for n values and window length k, recounting each window. The visualization caps nums at 12 values from 1 to 9; the official bounds are not verified here.',
  examples: [
    { label: 'Mixed windows', input: '{"nums":[1,2,2,3,3,3],"k":2}' },
    { label: 'Single window', input: '{"nums":[4,4,4],"k":3}' },
    { label: 'Tie in a window', input: '{"nums":[3,1,1,3],"k":2}' },
    { label: 'Single value', input: '{"nums":[1],"k":1}' },
    { label: 'Equal values', input: '{"nums":[2,2,2,2],"k":3}' },
    { label: 'Largest length and value', input: '{"nums":[9,9,9,9,9,9,9,9,9,9,9,9],"k":12}' },
    { label: 'Long run: 12 values', input: '{"nums":[2,7,7,2,4,9,6,7,2,2,3,6],"k":5}' },
  ],
}

export default function Problem3672Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <WindowModeView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
