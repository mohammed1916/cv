import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1602',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with tree (level-order array, null for missing children) and u (a value in the tree)',
  url: 'https://leetcode.com/problems/find-nearest-right-node-in-binary-tree/',
}

export default function Problem1602Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Level order lists each level from left to right, so the node after u in its level is the one to its right.</p>
      <p>Once u is found, the search ends: the answer is the next entry of that level, or null for the rightmost node.</p>
    </>}
  />
}
