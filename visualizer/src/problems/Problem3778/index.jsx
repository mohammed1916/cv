import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WaiverGraphView from './WaiverGraphView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Node 0 with no edge waived.' },
    { id: 'pop', label: 'Settle', description: 'The cheapest unfinished state is final.' },
    { id: 'relax', label: 'Relax', description: 'Try to improve a neighbour state.' },
    { id: 'done', label: 'Result', description: 'Read the best state at node n minus 1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges ([u, v, weight] triples)',
  url: 'https://leetcode.com/problems/minimum-distance-excluding-one-maximum-weighted-edge/',
  complexity: 'O((V + E) log V) time with a heap in general; this visualization uses a simple scan over the 2n states, so it runs in O(n^2 + E) for n up to 8.',
  examples: [
    { label: 'Two routes', input: '{"n":5,"edges":[[0,1,3],[1,4,6],[0,2,2],[2,3,8],[3,4,1],[1,2,5]]}' },
    { label: 'Heavy direct edge', input: '{"n":4,"edges":[[0,1,10],[1,3,1],[0,2,2],[2,3,3]]}' },
    { label: "Two nodes", input: "{\"n\":2,\"edges\":[[0,1,5]]}" },
    { label: "Equal weights", input: "{\"n\":3,\"edges\":[[0,1,4],[1,2,4],[0,2,4]]}" },
    { label: "Heaviest weights at length 8", input: "{\"n\":8,\"edges\":[[0,1,1000],[1,2,1000],[2,3,1000],[3,4,1000],[4,5,1000],[5,6,1000],[6,7,1000],[0,7,1000]]}" },
    { label: "Long run: 8 nodes with extra edges", input: "{\"n\":8,\"edges\":[[0,1,368],[1,2,966],[2,3,397],[0,4,815],[3,5,888],[5,6,616],[0,7,772],[2,5,824],[1,6,508]]}" },
  ],
}

export default function MinimumDistanceExcludingOneMaximumWeightedEdge() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <WaiverGraphView run={run} step={step} />} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Each node has two states: the path so far has not waived an edge, or it has waived exactly one. Waiving an edge costs nothing, so the answer is the cheapest finished state at the last node.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
