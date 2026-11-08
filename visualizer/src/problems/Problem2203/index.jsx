import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PathMeetView from './PathMeetView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2203',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with n, edges, src1, src2 and dest, e.g. {"n":4,"edges":[[0,1,2],[1,2,1]],"src1":0,"src2":1,"dest":3}',
  url: 'https://leetcode.com/problems/minimum-weighted-subgraph-with-the-required-paths/',
  complexity: 'Three Dijkstra runs, O((n + m) log n) with a heap. The visualization uses a simple O(n^2) Dijkstra and caps the graph at 7 nodes.',
  examples: [
    { label: 'Merge point', input: '{"n":4,"edges":[[0,1,2],[1,2,1],[0,2,4],[2,3,1],[1,3,5]],"src1":0,"src2":1,"dest":3}' },
    { label: 'Unreachable', input: '{"n":3,"edges":[[0,1,1],[1,2,1]],"src1":0,"src2":2,"dest":1}' },
    { label: 'Two sources into one', input: '{"n":3,"edges":[[0,2,3],[1,2,2]],"src1":0,"src2":1,"dest":2}' },
    { label: 'Equal weights tie', input: '{"n":3,"edges":[[0,2,1],[1,2,1]],"src1":0,"src2":1,"dest":2}' },
    { label: 'Largest weights', input: '{"n":7,"edges":[[0,1,9],[1,2,9],[2,3,9],[4,5,9],[5,6,9],[0,6,1],[1,6,2],[3,6,3],[6,4,1]],"src1":0,"src2":1,"dest":6}' },
    { label: 'Long run: seven nodes', input: '{"n":7,"edges":[[0,3,2],[1,3,4],[3,4,1],[4,5,3],[4,6,2],[2,5,5],[6,5,1]],"src1":0,"src2":1,"dest":5}' },
  ],
}

export default function Problem2203Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PathMeetView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
