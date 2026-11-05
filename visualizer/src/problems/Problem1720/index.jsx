import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1720',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with encoded (the XOR of neighbours) and first (arr[0])',
  url: 'https://leetcode.com/problems/decode-xored-array/',
}

export default function Problem1720Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>XOR undoes itself: if encoded[i] = arr[i] XOR arr[i+1], then arr[i+1] = arr[i] XOR encoded[i].</p>
      <p>So the array can be rebuilt from its first element, one step at a time.</p>
    </>}
  />
}
