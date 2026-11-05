import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1738',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with matrix (rows of integers) and k (1-indexed rank)',
  url: 'https://leetcode.com/problems/find-kth-largest-xor-coordinate-value/',
}

export default function Problem1738Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Each cell's value is the XOR of the rectangle from (0, 0). Inclusion and exclusion with XOR removes the overlap.</p>
      <p>After computing every prefix, sorting the values gives the kth largest directly.</p>
    </>}
  />
}
