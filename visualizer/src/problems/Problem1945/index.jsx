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
  question: "Convert a string of letters to digits, sum the digits, and repeat the digit sum a given number of times.",
  approaches: [
    { name: "Convert and repeat", intuition: "Turn letters into their alphabet positions, sum digits once, then sum again k minus one times.", time: "O(n + k * digits)", space: "O(n)" },
  ],
  examples: [
    { label: 'Two transforms', input: '{"s":"hello","k":2}' },
    { label: 'One transform', input: '{"s":"abc","k":1}' },
    { label: 'Single letter', input: '{"s":"a","k":1}' },
    { label: 'Repeated letter, largest k', input: '{"s":"zz","k":6}' },
    { label: 'Long run: twelve letters', input: '{"s":"mpuhyhihofax","k":6}' },
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
