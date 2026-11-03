import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ResidueCostView from './ResidueCostView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3937',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (positive integers) and k (2 to 12)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-modulo-alternating-i/',
  complexity: 'O(k * n + k^2) time and O(k) space for n values and modulus k. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Residues three', input: '{"nums":[7,4,9,2,5],"k":3}' },
    { label: 'Residues four', input: '{"nums":[10,11,20,21],"k":4}' },
  ],
}

export default function Problem3937Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ResidueCostView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
