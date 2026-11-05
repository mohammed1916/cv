import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PileView from './PileView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2202',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums and k, e.g. {"nums":[1,7,2],"k":3}',
  url: 'https://leetcode.com/problems/maximize-the-topmost-element-after-k-moves/',
  complexity: 'O(min(n, k)) time and O(1) extra space. The page caps the pile at 10 values and k at 12.',
  examples: [
    { label: 'Mixed pile', input: '{"nums":[1,7,2],"k":3}' },
    { label: 'Single value, even moves', input: '{"nums":[2],"k":2}' },
    { label: 'No moves', input: '{"nums":[9,1,3],"k":0}' },
  ],
}

export default function Problem2202Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PileView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
