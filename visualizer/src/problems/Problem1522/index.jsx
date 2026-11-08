import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeightPairView from './HeightPairView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1522',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with children (ordered child indices per node; node 0 is the root)',
  url: 'https://leetcode.com/problems/diameter-of-n-ary-tree/description/',
  complexity: 'O(n) time and O(h) recursion depth for n nodes. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Diameter 5', input: '{"children":[[1,2,3],[4,5],[],[6],[],[],[7],[]]}' },
    { label: 'Single node', input: '{"children":[[]]}' },
    { label: 'Path of three', input: '{"children":[[1],[2],[]]}' },
    { label: 'Two nodes', input: '{"children":[[1],[]]}' },
    { label: 'Two equal branches', input: '{"children":[[1,2],[],[]]}' },
    { label: 'Wide star', input: '{"children":[[1,2,3,4,5,6,7,8,9,10,11],[],[],[],[],[],[],[],[],[],[],[]]}' },
    { label: 'Long run: 12 nodes', input: '{"children":[[1,2,3,4],[5,9],[],[11],[6],[7],[8,10],[],[],[],[],[]]}' },
  ],
}

export default function Problem1522Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HeightPairView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
