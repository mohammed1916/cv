import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1730',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of grid rows: * start, # food, O free cell, X obstacle',
  url: 'https://leetcode.com/problems/shortest-path-to-get-food/',
  question: "Find the shortest route from your position to a food cell on a grid with obstacles.",
  approaches: [
    { name: "Breadth-first search", intuition: "Explore the grid in rings of equal distance and stop at the first food cell.", time: "O(m * n)", space: "O(m * n)" },
  ],
}

export default function Problem1730Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Every step costs the same, so breadth-first search reaches cells in order of distance.</p>
      <p>The first food cell taken from the queue is therefore the nearest one.</p>
    </>}
  />
}
