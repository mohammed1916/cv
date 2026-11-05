import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairGridView from './PairGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2183',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums and k, e.g. {"nums":[1,2,3,4,5],"k":2}',
  url: 'https://leetcode.com/problems/count-array-pairs-divisible-by-k/',
  complexity: 'O(n^2) pair checks in this visualization. The efficient version groups values by gcd with k. The page caps n at 10 and values at 30.',
  examples: [
    { label: 'Five values', input: '{"nums":[1,2,3,4,5],"k":2}' },
    { label: 'No pair', input: '{"nums":[1,2,3,4],"k":5}' },
    { label: 'Split factors', input: '{"nums":[2,3],"k":6}' },
  ],
}

export default function Problem2183Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PairGridView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
