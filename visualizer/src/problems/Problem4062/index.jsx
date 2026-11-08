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
    { label: "All zeros", input: "{\"source\":[0,0],\"target\":[0,0]}" },
    { label: "Equal arrays", input: "{\"source\":[4,4,4],\"target\":[4,4,4]}" },
    { label: "Extreme values", input: "{\"source\":[1000000000,-1000000000],\"target\":[-1000000000,1000000000]}" },
    { label: "Long run: twelve values", input: "{\"source\":[-817389248,-196383158,388565599,450014960,672122801,39706316,663595537,420145630,849688119,-704843777,486080831,-392222369],\"target\":[39706316,663595537,420145630,849688119,-704843777,486080831,-392222369,-817389248,-196383158,388565599,450014960,672122801]}" },
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
