import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1642',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with heights (building heights), bricks and ladders',
  url: 'https://leetcode.com/problems/furthest-building-you-can-reach/',
  question: "Given building heights and limited bricks and ladders, find the furthest building you can reach by climbing.",
  approaches: [
    { name: "Ladders on the largest climbs", intuition: "Use ladders on the biggest climbs so far and pay bricks for the rest, tracked with a min-heap.", time: "O(n log n)", space: "O(ladders)" },
  ],
}

export default function Problem1642Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Ladders are best spent on the biggest climbs, but we only learn the biggest climbs as we walk.</p>
      <p>Keep the climbs covered by ladders in a min-heap. When there are too many, the smallest one pays bricks.</p>
    </>}
  />
}
