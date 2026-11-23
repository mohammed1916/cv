import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1710',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with boxTypes ([count, units per box] pairs) and truckSize',
  url: 'https://leetcode.com/problems/maximum-units-on-a-truck/',
  question: "Load boxes with a unit count each onto a truck with a box capacity, maximising the total units.",
  approaches: [
    { name: "Greedy by units per box", intuition: "Sort box types by units per box and take as many of the best as fit.", time: "O(n log n)", space: "O(n)" },
  ],
}

export default function Problem1710Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Each slot on the truck is worth the units of the box it holds, so fill the slots with the densest boxes first.</p>
      <p>A type with fewer boxes than the room left is taken whole; the last type fills the remaining slots.</p>
    </>}
  />
}
