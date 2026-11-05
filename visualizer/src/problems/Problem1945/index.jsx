import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1945',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s and k (e.g. {"s":"hello","k":2})',
  url: 'https://leetcode.com/problems/sum-of-digits-of-string-after-convert/',
  complexity: 'O(n + d k) time where n is the string length and d the digit count of the intermediate values.',
  examples: [
    { label: 'Two transforms', input: '{"s":"hello","k":2}' },
    { label: 'One transform', input: '{"s":"abc","k":1}' },
  ],
}

export default function Problem1945Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      {step.pieces && <p aria-label="Letter positions">Letters as numbers: <strong>{step.pieces.join(' · ')}</strong></p>}
      <p>Current value: <strong style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>{step.value}</strong></p>
      <p>Transforms done: {step.step} of {step.k}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
