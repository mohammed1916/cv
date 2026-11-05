import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1702',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON string of 0s and 1s',
  url: 'https://leetcode.com/problems/maximum-binary-string-after-change/',
}

export default function Problem1702Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Operation 1 turns "00" into "10", and operation 2 moves a zero right past a one. Zeros can be merged and pushed to the right.</p>
      <p>All zeros end up as one zero, and the largest result puts it as far right as possible: at first + zeros - 1.</p>
    </>}
  />
}
