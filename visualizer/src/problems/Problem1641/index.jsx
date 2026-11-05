import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1641',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Integer n from 1 to 50 (string length)',
  url: 'https://leetcode.com/problems/count-sorted-vowel-strings/',
}

export default function Problem1641Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>A sorted string is decided by its last vowel. Ending at vowel v means the previous letter is any vowel up to v.</p>
      <p>So each column of the next row is the running sum of the current row up to that vowel.</p>
    </>}
  />
}
