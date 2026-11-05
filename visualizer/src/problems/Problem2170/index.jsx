import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ParityView from './ParityView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2170',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Positive integers as JSON, e.g. [3,1,3,2,4,3]',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-the-array-alternating/',
  complexity: 'O(n) time and O(n) space for the two frequency tables. The visualization caps the array at 12 values from 1 to 9.',
  examples: [
    { label: 'Mixed parity', input: '[3,1,3,2,4,3]' },
    { label: 'Shared mode', input: '[4,4,4,4]' },
    { label: 'Single value', input: '[1,2,2,2,2]' },
  ],
}

export default function Problem2170Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ParityView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
