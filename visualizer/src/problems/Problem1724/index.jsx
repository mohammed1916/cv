import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1724',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with n, edgeList ([u, v, distance]) and queries ([p, q, limit]) asked in order',
  url: 'https://leetcode.com/problems/checking-existence-of-edge-length-limited-paths-ii/',
}

export default function Problem1724Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Two nodes are joined by a path with all edges below a limit exactly when their path in the minimum spanning forest has a largest edge below that limit.</p>
      <p>The forest is built once when the object is created; each query only reads one path.</p>
    </>}
  />
}
