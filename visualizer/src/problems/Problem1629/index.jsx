import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1629',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with releaseTimes (strictly increasing) and keysPressed (one lowercase letter per release)',
  url: 'https://leetcode.com/problems/slowest-key/',
  question: "Given release times and the keys pressed, find the key that was held the longest, breaking ties with the larger key.",
  approaches: [
    { name: "Single scan", intuition: "Track the longest press so far, replacing it when a later press is longer or ties with a larger key.", time: "O(n)", space: "O(1)" },
  ],
}

export default function Problem1629Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The first press lasts from time 0. Every later press lasts from the previous release to its own release.</p>
      <p>Only the longest duration matters, and ties are broken by the larger key letter.</p>
    </>}
  />
}
