import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairView from './PairView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2169',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Two non-negative integers as JSON, e.g. [5,4]',
  url: 'https://leetcode.com/problems/count-operations-to-obtain-zero/',
  complexity: 'Each operation removes one copy of the smaller value, so the loop runs as many times as the Euclid-style subtraction chain. The visualization caps values at 60.',
  examples: [
    { label: 'Mixed', input: '[5,4]' },
    { label: 'Small pair', input: '[2,3]' },
    { label: 'Equal', input: '[10,10]' },
  ],
}

export default function Problem2169Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PairView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
