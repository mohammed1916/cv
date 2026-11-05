import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1708',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with nums (distinct integers) and k (window length)',
  url: 'https://leetcode.com/problems/largest-subarray-length-k/',
}

export default function Problem1708Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Two subarrays of the same length are compared at their first difference. Because the values are distinct, the first element decides.</p>
      <p>So the largest subarray starts at the largest value among the positions that leave room for k elements.</p>
    </>}
  />
}
