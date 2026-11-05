import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PartsView from './PartsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2178',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'A positive integer total, e.g. 28',
  url: 'https://leetcode.com/problems/maximum-split-of-positive-even-integers/',
  complexity: 'O(sqrt(total)) time for the parts taken and O(sqrt(total)) space for the result. The visualization caps the total at 400.',
  examples: [
    { label: 'Even total', input: '28' },
    { label: 'Small even', input: '12' },
    { label: 'Odd total', input: '7' },
  ],
}

export default function Problem2178Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PartsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
