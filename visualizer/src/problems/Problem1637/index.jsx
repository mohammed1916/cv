import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1637',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with points: a list of [x, y] pairs',
  url: 'https://leetcode.com/problems/widest-vertical-area-between-two-points-containing-no-points/',
  question: "Find the widest vertical strip between two points' x-values that contains no point inside it.",
  approaches: [
    { name: "Sort x and take gaps", intuition: "Sort the distinct x-values and take the largest gap between neighbours.", time: "O(n log n)", space: "O(n)" },
  ],
}

export default function Problem1637Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Only the x coordinates matter for vertical areas. The y values can be anything.</p>
      <p>After sorting the x values, the widest empty strip is the largest difference between two neighbours.</p>
    </>}
  />
}
