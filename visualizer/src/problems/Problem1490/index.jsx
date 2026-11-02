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
  complexity: 'O(n) time and O(h) recursion depth for n nodes, plus O(n) for the new nodes. The visualization caps the tree at 10 nodes with values from 0 to 9; the draft does not verify the official bounds.',
  examples: [
    { label: 'Ordered children', input: '{"val":[1,3,2,4,5,6],"children":[[1,2,3],[4,5],[],[],[],[]]}' },
    { label: 'Single node', input: '{"val":[5],"children":[[]]}' },
    { label: 'Null root', input: '{"val":[],"children":[]}' },
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
