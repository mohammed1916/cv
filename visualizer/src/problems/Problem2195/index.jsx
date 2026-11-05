import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import NumberLineView from './NumberLineView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2195',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums and k, e.g. {"nums":[5,6,8],"k":2}',
  url: 'https://leetcode.com/problems/append-k-integers-with-minimal-sum/',
  complexity: 'O(n log n) time for the sort and O(n + k) for the gap walk. The page caps the list at 10 values and k at 10.',
  examples: [
    { label: 'Gap fill', input: '{"nums":[5,6,8],"k":2}' },
    { label: 'Start at one', input: '{"nums":[1,2,3],"k":2}' },
    { label: 'Single value', input: '{"nums":[7],"k":3}' },
  ],
}

export default function Problem2195Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <NumberLineView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
