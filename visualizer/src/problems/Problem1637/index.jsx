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
