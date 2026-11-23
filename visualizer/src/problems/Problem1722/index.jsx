import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1722',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with source, target (equal-length arrays) and allowedSwaps (position pairs)',
  url: 'https://leetcode.com/problems/minimize-hamming-distance-after-swap-operations/',
  question: "Given allowed swaps between indices, rearrange one array to be as close as possible to a target in Hamming distance.",
  approaches: [
    { name: "Union-find groups", intuition: "Group indices connected by swaps, then match values to target positions within each group.", time: "O(n)", space: "O(n)" },
  ],
}

export default function Problem1722Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Swaps chain together: if 0 can swap with 1 and 1 with 2, then 0, 1 and 2 can be permuted arbitrarily among themselves.</p>
      <p>Within a group, a position matches when the target value is still available among the group's source values.</p>
    </>}
  />
}
