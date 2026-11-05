import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1746',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of integers (exactly one element is squared)',
  url: 'https://leetcode.com/problems/maximum-subarray-sum-after-one-operation/',
}

export default function Problem1746Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Two running values are kept per position: the best subarray ending here without the squared element, and with it.</p>
      <p>Squaring never lowers a value, so the best sum using the square is at least the plain best sum.</p>
    </>}
  />
}
