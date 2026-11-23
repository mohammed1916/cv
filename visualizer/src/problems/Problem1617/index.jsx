import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1617',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with n (2 to 10 in this visual) and edges: the n-1 pairs of a tree',
  url: 'https://leetcode.com/problems/count-subtrees-with-maximum-distance-between-cities/',
  question: "Count the subsets of cities in a tree that stay connected, grouped by the largest distance between two cities in the subset.",
  approaches: [
    { name: "Enumerate connected subsets", intuition: "Try every subset, keep the connected ones, and record the diameter of each.", time: "O(2^n * n^2) in this form", space: "O(n^2)" },
  ],
}

export default function Problem1617Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>A subset is a valid subtree only when its cities stay connected through the tree's own edges.</p>
      <p>Its diameter is the longest distance between two of its cities. Each subset goes into exactly one bucket.</p>
    </>}
  />
}
