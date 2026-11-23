import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1742',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with lowLimit and highLimit (the ball numbers, inclusive)',
  url: 'https://leetcode.com/problems/maximum-number-of-balls-in-a-box/',
  question: "Balls numbered in a range go into boxes by the sum of their digits; find the largest number of balls in any box.",
  approaches: [
    { name: "Count by digit sum", intuition: "Count each ball's digit-sum box in a map and keep the maximum.", time: "O(n * digits)", space: "O(boxes)" },
  ],
}

export default function Problem1742Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The box of a ball is the sum of its digits, so every ball can be placed by looking at its digits alone.</p>
      <p>Counting per box and taking the largest count gives the answer.</p>
    </>}
  />
}
