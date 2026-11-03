import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairTransferView from './PairTransferView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4062',
  phases: [
    { id: 'sum', label: 'Totals', description: 'Compare the sums of the two arrays.' },
    { id: 'transfer', label: 'Transfer', description: 'Fix one position with a pair operation.' },
    { id: 'done', label: 'Result', description: 'Check whether the last position matches.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with equal-length source and target arrays, e.g. {"source":[1,2,3],"target":[6,0,0]}',
  url: 'https://leetcode.com/problems/transform-array-using-pair-operations/',
  complexity: 'O(n) time and O(n) space for n values. The visualization caps each array at 12 values.',
  examples: [
    { label: 'Same total', input: '{"source":[1,2,3],"target":[6,0,0]}' },
    { label: 'Different total', input: '{"source":[4,1],"target":[4,2]}' },
  ],
}

export default function TransformArrayPairOperationsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PairTransferView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
