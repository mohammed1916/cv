import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1706',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON grid of 1 (moves right) and -1 (moves left) with equal row lengths',
  url: 'https://leetcode.com/problems/where-will-the-ball-fall/',
}

export default function Problem1706Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The ball follows the cell it is in: a 1 sends it one column right, a -1 one column left.</p>
      <p>It gets stuck when the cell beside it sends it back, which forms a V, or when it reaches a wall.</p>
    </>}
  />
}
