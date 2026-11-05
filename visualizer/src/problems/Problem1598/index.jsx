import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1598',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of log entries: "x/" enters, "../" goes up, "./" stays',
  url: 'https://leetcode.com/problems/crawler-log-folder/',
}

export default function Problem1598Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Only the depth matters: the answer is how far the folder is from the main folder.</p>
      <p>"../" can never go above the main folder, so depth never drops below 0.</p>
    </>}
  />
}
