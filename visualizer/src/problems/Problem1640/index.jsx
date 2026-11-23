import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1640',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with arr (distinct integers) and pieces (arrays whose lengths add up to arr length)',
  url: 'https://leetcode.com/problems/check-array-formation-through-concatenation/',
  question: "Given distinct values and a list of pieces, check whether the pieces can be joined in some order to form the array.",
  approaches: [
    { name: "Index by first value", intuition: "Map each piece's first value to its index, then walk the array one piece at a time.", time: "O(n + total length)", space: "O(n)" },
  ],
}

export default function Problem1640Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Each value appears once, so the piece that must come next is fixed by the value at the current position.</p>
      <p>Pieces keep their internal order: the walk must match each piece exactly before it moves past it.</p>
    </>}
  />
}
