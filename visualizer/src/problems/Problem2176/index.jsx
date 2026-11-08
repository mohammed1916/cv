import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairScanView from './PairScanView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2176',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums and k, e.g. {"nums":[3,1,2,2],"k":2}',
  url: 'https://leetcode.com/problems/count-equal-and-divisible-pairs-in-an-array/',
  complexity: 'O(n^2) time for the pair scan and O(1) extra space. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Repeats', input: '{"nums":[3,1,2,2,2,1,3],"k":2}' },
    { label: 'No repeats', input: '{"nums":[1,2,3,4],"k":1}' },
    { label: 'Divisor check', input: '{"nums":[5,5,5],"k":2}' },
    { label: 'Single value', input: '{"nums":[4],"k":1}' },
    { label: 'Pair with index product zero', input: '{"nums":[2,2],"k":2}' },
    { label: 'No equal values', input: '{"nums":[1,2,3,4],"k":5}' },
    { label: 'Largest input, k twelve', input: '{"nums":[9,9,9,9,9,9,9,9,9,9,9,9],"k":12}' },
    { label: 'Long run: 12 values', input: '{"nums":[1,3,1,2,3,2,3,2,3,1,3,1],"k":6}' },
  ],
}

export default function Problem2176Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PairScanView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
