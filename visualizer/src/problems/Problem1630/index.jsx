import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1630',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with nums and the query arrays l and r (inclusive indices)',
  url: 'https://leetcode.com/problems/arithmetic-subarrays/',
  question: "For several ranges of an array, decide whether the values in each range can be rearranged into an arithmetic sequence.",
  approaches: [
    { name: "Sort each range", intuition: "Copy each range, sort it, and check that all neighbouring gaps are equal.", time: "O(m * k log k)", space: "O(k)" },
  ],
}

export default function Problem1630Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>A sequence can be rearranged into an arithmetic sequence exactly when, once sorted, all neighbouring gaps are equal.</p>
      <p>The original array is never reordered: each query sorts only its own copy of the slice.</p>
    </>}
  />
}
