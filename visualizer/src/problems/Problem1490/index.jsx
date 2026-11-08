import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import NaryCloneView from './NaryCloneView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1490',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with val (node values) and children (ordered child indices per node; node 0 is the root)',
  url: 'https://leetcode.com/problems/clone-n-ary-tree/description/',
  complexity: 'O(n) time and O(h) recursion depth for n nodes, plus O(n) for the new nodes. The visualization caps the tree at 10 nodes with values from 0 to 9;',
  examples: [
    { label: 'Ordered children', input: '{"val":[8,4,6,2,7],"children":[[1,2],[3],[],[4],[]]}' },
    { label: 'Single node', input: '{"val":[5],"children":[[]]}' },
    { label: 'Null root', input: '{"val":[],"children":[]}' },
    { label: 'Repeated values', input: '{"val":[3,3,3],"children":[[1,2],[],[]]}' },
    { label: 'Wide root', input: '{"val":[9,0,9,0,9,0,9,0,9,0],"children":[[1,2,3,4,5,6,7,8,9],[],[],[],[],[],[],[],[],[]]}' },
    { label: 'Zero values chain', input: '{"val":[0,0,0],"children":[[1],[2],[]]}' },
    { label: 'Long run: 10 nodes', input: '{"val":[8,4,9,5,2,9,4,1,6,0],"children":[[1,3,8],[2,5],[4,7],[6],[],[],[9],[],[],[]]}' },
  ],
}

export default function Problem1490Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <NaryCloneView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
