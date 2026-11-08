import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StackView from './StackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2197',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of positive integers, e.g. [6,4,3,2,7,6,2]',
  url: 'https://leetcode.com/problems/replace-non-coprime-numbers-in-array/',
  complexity: 'O(n log V) time with the gcd step and O(n) space for the stack. The page caps the length at 10 and values at 60.',
  examples: [
    { label: 'Mixed factors', input: '[6,4,3,2,7,6,2]' },
    { label: 'Runs', input: '[2,2,1,1,3,3,3]' },
    { label: 'Pairs equal', input: '[4,4]' },
    { label: 'Single value', input: '[1]' },
    { label: 'All equal at max', input: '[60,60,60,60,60,60,60,60,60,60]' },
    { label: 'Long run: 10 values', input: '[12,18,24,30,36,42,48,54,60,6]' },
  ],
}

export default function Problem2197Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <StackView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
