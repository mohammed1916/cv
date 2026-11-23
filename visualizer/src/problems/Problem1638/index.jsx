import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1638',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with strings s and t (lowercase letters)',
  url: 'https://leetcode.com/problems/count-substrings-that-differ-by-one-character/',
  question: "Count substring pairs of equal length that differ in exactly one character position.",
  approaches: [
    { name: "Expand from each mismatch", intuition: "Pick each start pair, mark the single mismatch, and extend while the rest matches.", time: "O(m * n * min(m, n))", space: "O(1)" },
  ],
}

export default function Problem1638Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Each pair of start positions i and j defines a family of substrings, one per length.</p>
      <p>Growing the length keeps the number of mismatches or increases it. Stop once it passes one mismatch.</p>
    </>}
  />
}
