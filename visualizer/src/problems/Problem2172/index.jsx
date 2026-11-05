import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SlotsView from './SlotsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2172',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums and slots, e.g. {"nums":[1,2,3,4,5,6],"slots":3}',
  url: 'https://leetcode.com/problems/maximum-and-sum-of-array/',
  complexity: 'O(2^(2k) * 2k) time over the unit masks, with k slots. The visualization caps slots at 3 and numbers at 6.',
  examples: [
    { label: 'Full slots', input: '{"nums":[1,2,3,4,5,6],"slots":3}' },
    { label: 'Spare room', input: '{"nums":[1,3,10,4,7,1],"slots":3}' },
    { label: 'One slot', input: '{"nums":[2,3],"slots":1}' },
  ],
}

export default function Problem2172Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SlotsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
