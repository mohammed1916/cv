import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1725',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of [width, height] pairs',
  url: 'https://leetcode.com/problems/number-of-rectangles-that-can-form-the-largest-square/',
}

export default function Problem1725Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>A rectangle's largest square side is its shorter side, so only min(width, height) is needed per rectangle.</p>
      <p>Track the largest side and how many rectangles reach it.</p>
    </>}
  />
}
