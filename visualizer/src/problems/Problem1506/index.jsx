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
  complexity: 'O(n) time and O(1) extra space for n nodes: one pass XORs every value and every child reference. The visualization caps the tree at 12 nodes with values from 0 to 99. The result is the index of the supplied node.',
  examples: [
    { label: 'Shuffled list', input: '{"vals":[7,3,9,5],"children":[[],[7],[],[3,9]]}' },
    { label: 'Root in the middle', input: '{"vals":[2,8,4],"children":[[],[2,4],[]]}' },
    { label: 'Single node', input: '{"vals":[9],"children":[[]]}' },
    { label: 'Two nodes', input: '{"vals":[4,6],"children":[[6],[]]}' },
    { label: 'Value limits', input: '{"vals":[0,99,50],"children":[[99,50],[],[]]}' },
    { label: 'Chain of four', input: '{"vals":[1,2,3,4],"children":[[2],[3],[4],[]]}' },
    { label: 'Long run: 12 nodes', input: '{"vals":[7,90,87,97,6,13,81,21,12,45,47,40],"children":[[90,87,45,40],[81,21],[97,12],[6],[13],[],[],[47],[],[],[],[]]}' },
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
