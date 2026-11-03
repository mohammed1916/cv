import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DivisorView from './DivisorView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3927',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of 1 to 12 positive integers up to 100',
  url: 'https://leetcode.com/problems/minimize-array-sum-using-divisible-replacements/',
  complexity: 'O(n * d) time for n values and d distinct values, after sorting the distinct values. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Shared divisors', input: '[6, 9, 4, 3]' },
    { label: 'Chain of multiples', input: '[10, 5, 2, 15]' },
  ],
}

export default function Problem3927Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DivisorView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
