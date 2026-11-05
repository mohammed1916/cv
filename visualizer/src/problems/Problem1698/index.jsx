import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1698',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON string of lowercase letters',
  url: 'https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/',
}

export default function Problem1698Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Every substring is a prefix of some suffix. Counting prefixes of all suffixes counts each substring once per place it starts.</p>
      <p>Neighbouring suffixes in sorted order share a prefix; that shared part was already counted by the earlier suffix, so it is subtracted.</p>
    </>}
  />
}
