import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1743',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of adjacent pairs [a, b] that form one chain of distinct values',
  url: 'https://leetcode.com/problems/restore-the-array-from-adjacent-pairs/',
  question: "Rebuild an original array from a list of adjacent pairs.",
  approaches: [
    { name: "Walk the neighbour graph", intuition: "Start from an endpoint, then walk from neighbour to neighbour.", time: "O(n)", space: "O(n)" },
  ],
}

export default function Problem1743Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Every interior value appears in two pairs, and the two ends appear in one pair each.</p>
      <p>Starting at an end and always leaving by the neighbour not just visited rebuilds the array.</p>
    </>}
  />
}
