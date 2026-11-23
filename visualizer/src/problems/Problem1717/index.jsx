import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1717',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with s (letters a and b) and x, y (points for "ab" and "ba")',
  url: 'https://leetcode.com/problems/maximum-score-from-removing-substrings/',
  question: "Remove the substrings ab and ba for points, where one kind is worth more, to maximise the total score.",
  approaches: [
    { name: "Take the higher-scoring pair first", intuition: "Remove the higher-valued pair first, then the other pair from what remains.", time: "O(n)", space: "O(n)" },
  ],
}

export default function Problem1717Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Each pair removed earns its points and can only be removed from the same string, so the more valuable pair goes first.</p>
      <p>A stack finds every removable pair in one pass, because a removal can only create a new pair at its own position.</p>
    </>}
  />
}
