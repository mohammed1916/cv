import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ResidueCostView from './ResidueCostView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

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
    { label: 'Single value', input: '{"nums":[1],"k":2}' },
    { label: 'Equal values', input: '{"nums":[5,5,5],"k":4}' },
    { label: 'Largest values', input: '{"nums":[1000000000,1,999999999,2],"k":12}' },
    { label: 'Long run: 12 items', input: '{"nums":[183913782,322899069,808017839,128332069,172296655,324788083,118522340,632449916,932273889,429539708,817289067,320260592],"k":7}' },
  ],
}

export default function Problem3937Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <><IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i % run.input.k === step.r ? 'r' : ''} /><ResidueCostView run={run} step={step} /></>}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
