import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1592',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Text of lowercase letters and spaces, with at least one word',
  url: 'https://leetcode.com/problems/rearrange-spaces-between-words/',
}

export default function Problem1592Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The words are fixed; only the spaces can move, so the question is how to share them.</p>
      <p>Equal gaps are the total spaces divided by the number of gaps. The remainder is placed at the end.</p>
      <p>A single word has no gaps, so every space trails it.</p>
    </>}
  />
}
