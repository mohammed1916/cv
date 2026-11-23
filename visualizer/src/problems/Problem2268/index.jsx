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
  question: "Assign the lowercase letters to keys with a limited number of slots per key, minimising the total presses for a given text.",
  approaches: [
    { name: "Greedy by frequency", intuition: "Give the most frequent letters the cheapest slots, using nine keys with up to three presses each.", time: "O(26 log 26)", space: "O(1)" },
  ],
  examples: [
    { label: 'apple', input: 'banana' },
    { label: 'Full alphabet', input: 'abcdefghijklmnopqrstuvwxyz' },
    { label: 'Repeats', input: 'aaaabbc' },
    { label: 'Single letter', input: 'a' },
    { label: 'Equal frequencies', input: 'aabb' },
    { label: 'Twenty-six of one letter', input: 'aaaaaaaaaaaaaaaaaaaaaaaaaa' },
    { label: 'Long run: 26 letters', input: 'qzkwmjpvhtbnlgcxdyrsfeoiua' },
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
