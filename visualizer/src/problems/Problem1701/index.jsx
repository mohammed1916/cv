import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1701',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of [arrival, time] pairs in arrival order',
  url: 'https://leetcode.com/problems/average-waiting-time/',
}

export default function Problem1701Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Each order starts when the chef is free or when it arrives, whichever is later. Waiting runs from arrival to finish.</p>
      <p>Because the chef handles one order at a time, a late-finishing order pushes every later order back.</p>
    </>}
  />
}
