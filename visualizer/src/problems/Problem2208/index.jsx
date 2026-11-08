import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HalvingView from './HalvingView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2208',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of positive integers, e.g. [5,19,8,1]',
  url: 'https://leetcode.com/problems/minimum-operations-to-halve-array-sum/',
  complexity: 'O(n + k log n) time with a heap, where k is the number of halvings. The page caps the array at 8 values up to 20.',
  examples: [
    { label: 'Mixed', input: '[5,19,8,1]' },
    { label: 'Small trio', input: '[3,8,20]' },
    { label: 'Two equal', input: '[4,4]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Eight values with ties', input: '[20,1,20,1,20,1,20,1]' },
    { label: 'Long run: 8 values', input: '[13,4,17,9,2,11,6,15]' },
  ],
}

export default function Problem2208Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HalvingView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
