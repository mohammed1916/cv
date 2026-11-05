import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1700',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with students (0 circular, 1 square; the queue) and sandwiches (the stack, top first)',
  url: 'https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/',
}

export default function Problem1700Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Students keep their order, so the queue's order never matters. Only how many want each type matters.</p>
      <p>Each served sandwich removes one student who wanted it. If the top type has no takers left, the rest are stuck.</p>
    </>}
  />
}
