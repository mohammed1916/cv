import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1732',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of altitude gains',
  url: 'https://leetcode.com/problems/find-the-highest-altitude/',
}

export default function Problem1732Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The altitude at any point is the running sum of the gains so far.</p>
      <p>The answer is the largest running sum, and the starting altitude 0 is included.</p>
    </>}
  />
}
