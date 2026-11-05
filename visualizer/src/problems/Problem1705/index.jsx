import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1705',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with apples and days: equal-length arrays (apples[i] grow on day i and rot after days[i] days)',
  url: 'https://leetcode.com/problems/maximum-number-of-eaten-apples/',
}

export default function Problem1705Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Eating the apple that rots soonest never wastes anything, so each day the earliest-rotting fresh batch is eaten.</p>
      <p>Batches that have rotted are dropped first, so the top of the heap is always an apple that is still fresh.</p>
    </>}
  />
}
