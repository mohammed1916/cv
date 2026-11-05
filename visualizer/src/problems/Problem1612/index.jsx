import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1612',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with root1 and root2: level-order arrays of "+" and lowercase letters, null for missing children',
  url: 'https://leetcode.com/problems/check-if-two-expression-trees-are-equivalent/',
}

export default function Problem1612Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Addition is order-independent, so the shape of the tree does not matter. Only how many times each letter appears.</p>
      <p>The tally adds one for every letter in the first tree and takes one away for every letter in the second. Equivalent trees net to zero everywhere.</p>
    </>}
  />
}
