import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1636',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/sort-array-by-increasing-frequency/',
  question: "Sort an array so values with lower frequency come first, and ties go to the larger value first.",
  approaches: [
    { name: "Count then sort", intuition: "Count each value, then sort with a comparator on frequency and value.", time: "O(n log n)", space: "O(n)" },
  ],
}

export default function Problem1636Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Frequency is the first sort key, so every value stays together in one block.</p>
      <p>Within a block of equal frequency, the larger value goes first.</p>
    </>}
  />
}
