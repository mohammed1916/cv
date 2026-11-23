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
  question: "Split a positive integer into the largest number of distinct positive even integers.",
  approaches: [
    { name: "Greedy 2, 4, 6, ...", intuition: "Take the smallest even numbers in order while the rest still allows the next part; add any leftover to the last part.", time: "O(sqrt n)", space: "O(sqrt n)" },
  ],
  examples: [
    { label: 'Even total', input: '28' },
    { label: 'Small even', input: '12' },
    { label: 'Odd total', input: '7' },
    { label: 'Smallest total, one part', input: '2' },
    { label: 'Exactly one part', input: '4' },
    { label: 'Long run: many even parts', input: '390' },
    { label: 'Largest total', input: '400' },
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
