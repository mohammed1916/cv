import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ParityCountView from './ParityCountView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3917',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of 1 to 20 integers',
  url: 'https://leetcode.com/problems/count-indices-with-opposite-parity/',
  complexity: 'O(n^2) time and O(n) space for n values. The visualization caps the array at 20 values.',
  examples: [
    { label: 'Mixed values', input: '[4, 7, 2, 9, 6]' },
    { label: 'Short run', input: '[5, 2, 8]' },
  ],
}

export default function Problem3917Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ParityCountView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
