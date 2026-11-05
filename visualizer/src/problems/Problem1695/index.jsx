import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1695',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of positive integers',
  url: 'https://leetcode.com/problems/maximum-erasure-value/',
}

export default function Problem1695Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The erased subarray must have distinct values, so it is a window [l, r] that is always valid.</p>
      <p>When a value repeats, l moves right until it is gone. The window sum is then compared with the best so far.</p>
    </>}
  />
}
