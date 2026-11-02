import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import KeypadView from './KeypadView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2268',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase word (e.g. apple)',
  url: 'https://leetcode.com/problems/minimum-number-of-keypresses/',
  complexity: 'O(n + k log k) time for n letters and k distinct letters, with O(1) extra space for the 26-letter alphabet. The visualization caps the word at 26 letters; the draft does not verify the official length bound.',
  examples: [
    { label: 'apple', input: 'apple' },
    { label: 'Full alphabet', input: 'abcdefghijklmnopqrstuvwxyz' },
    { label: 'Repeats', input: 'aaaabbc' },
  ],
}

export default function Problem2268Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <KeypadView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
