import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1704',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON string of letters with even length',
  url: 'https://leetcode.com/problems/determine-if-string-halves-are-alike/',
}

export default function Problem1704Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The string is split exactly in half. Each half gets its own vowel count, and only the counts are compared.</p>
      <p>Vowels are counted in both cases, so capital letters count too.</p>
    </>}
  />
}
