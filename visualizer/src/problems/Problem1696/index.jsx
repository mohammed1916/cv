import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1696',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with nums and k (window size, at least 1)',
  url: 'https://leetcode.com/problems/jump-game-vi/',
}

export default function Problem1696Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Position i can be reached from any of the previous k positions, so its best score needs the maximum over that window.</p>
      <p>A deque keeps the window maximum: it holds candidates in decreasing score order, and the front expires when it leaves the window.</p>
    </>}
  />
}
