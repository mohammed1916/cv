import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GapGraphView from './GapGraphView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3919',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with strictly increasing nums and queries ([start, end] pairs)',
  url: 'https://leetcode.com/problems/minimum-cost-to-move-between-indices/',
  complexity: 'O(q * n^2) time for q queries on n indices with a simple selection scan. The visualization caps nums at 12 values.',
  examples: [
    { label: 'Spread gaps', input: '{"nums":[2,3,7,10,20],"queries":[[0,4],[4,1]]}' },
    { label: 'Tight cluster', input: '{"nums":[1,2,4],"queries":[[2,0],[0,2]]}' },
  ],
}

export default function Problem3919Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GapGraphView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
