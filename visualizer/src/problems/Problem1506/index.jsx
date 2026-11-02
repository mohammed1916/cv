import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import XorTallyView from './XorTallyView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1506',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with vals (distinct node values) and children (each entry lists child values)',
  url: 'https://leetcode.com/problems/find-root-of-n-ary-tree/description/',
  complexity: 'O(n) time and O(1) extra space for n nodes: one pass XORs every value and every child reference. The visualization caps the tree at 12 nodes with values from 0 to 99; the draft does not verify the official bounds. The result is the index of the supplied node.',
  examples: [
    { label: 'Shuffled list', input: '{"vals":[1,2,3,4,5],"children":[[2,3],[],[4,5],[],[]]}' },
    { label: 'Root last', input: '{"vals":[4,5,2,6,3,1],"children":[[],[],[],[],[],[4,5,2,6,3]]}' },
    { label: 'Single node', input: '{"vals":[9],"children":[[]]}' },
  ],
}

export default function Problem1506Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <XorTallyView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
