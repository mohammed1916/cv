import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1736',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON string HH:MM where any digit may be ?',
  url: 'https://leetcode.com/problems/latest-time-by-replacing-hidden-digits/',
  question: "Replace the hidden digits of a time string to get the latest valid time.",
  approaches: [
    { name: "Greedy digit by digit", intuition: "Pick each hidden digit as large as the time limits allow.", time: "O(1)", space: "O(1)" },
  ],
}

export default function Problem1736Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Fill the digits from the left, always taking the largest digit that still leaves a valid time.</p>
      <p>The first hour digit depends on the second: 2 only when the hour can be 20 to 23.</p>
    </>}
  />
}
