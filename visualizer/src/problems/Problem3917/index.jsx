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
    { label: 'Single value', input: '[6]' },
    { label: 'Equal values in two pairs', input: '[3,8,3,8]' },
    { label: 'Smallest and largest values', input: '[1,100,100,1]' },
    { label: 'Long run: 20 items', input: '[75,20,79,86,81,68,23,48,94,56,80,2,98,51,97,52,89,81,72,26]' },
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
