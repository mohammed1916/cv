import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1697',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with n, edgeList ([u, v, distance] triples) and queries ([p, q, limit] triples)',
  url: 'https://leetcode.com/problems/checking-existence-of-edge-length-limited-paths/',
}

export default function Problem1697Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>A query with a limit can use exactly the edges shorter than its limit. Sorting queries by limit lets the edge set only grow.</p>
      <p>Union-find keeps track of which nodes are connected as edges are added, so each query is one comparison of two roots.</p>
    </>}
  />
}
