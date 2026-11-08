import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowView from './WindowView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2168',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Digit string, e.g. 1212',
  url: 'https://leetcode.com/problems/unique-substrings-with-equal-digit-frequency/',
  complexity: 'O(n^2) windows with a constant-size digit check each. The visualization caps the string at 12 digits.',
  examples: [
    { label: 'Alternating', input: '1212' },
    { label: 'Mixed run', input: '12321' },
    { label: 'Repeated digit', input: '1111' },
    { label: 'Single digit', input: '7' },
    { label: 'Repeated digit', input: '11' },
    { label: 'Twelve distinct digits', input: '123456789012' },
    { label: 'Long run: 12 digits', input: '738497523775' },
  ],
}

export default function Problem2168Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WindowView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
