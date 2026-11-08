import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Each node holds the empty path with total 0.' },
    { id: 'layer', label: 'Add an edge', description: 'Extend every stored total along each edge and keep totals below t.' },
    { id: 'done', label: 'Complete', description: 'Report the largest total stored after k edges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges, k and t (JSON)',
  url: 'https://leetcode.com/problems/maximum-weighted-k-edge-path/',
  complexity: 'O(k * m * t) time for the reachable totals. The visualization caps n at 8 and edges at 12.',
  examples: [
    { label: 'Two routes into node 1', input: '{"n":4,"edges":[[0,2,4],[2,1,1],[0,3,2],[3,1,5]],"k":2,"t":6}' },
    { label: 'Chain with one step budget', input: '{"n":5,"edges":[[0,1,3],[1,2,2],[2,4,6]],"k":1,"t":7}' },
    { label: 'One node, no edges', input: '{"n":1,"edges":[],"k":0,"t":1}' },
    { label: 'Equal weights', input: '{"n":3,"edges":[[0,1,2],[1,2,2]],"k":1,"t":4}' },
    { label: 'Largest weights and limits', input: '{"n":3,"edges":[[0,1,10],[0,2,10]],"k":12,"t":60}' },
    { label: 'Long run: 8 nodes, 12 edges', input: '{"n":8,"edges":[[0,1,6],[0,2,6],[0,3,6],[0,4,6],[0,6,5],[1,3,1],[1,4,3],[1,5,6],[2,3,9],[2,4,4],[2,7,2],[3,4,1]],"k":4,"t":40}' },
  ],
}

export default function MaximumWeightedKEdgePath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Edges as [u, v, w]" length={run.input.edges.length} valueAt={i => `[${run.input.edges[i].join(', ')}]`} active={-1} />
    <output aria-label="Layer">{`Edges used: ${step.layer} of ${run.input.k}. ${step.best === null ? '' : `Best: ${step.best}`}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Because the graph is acyclic, a walk with k edges is a path, so tracking the reachable totals gives every candidate sum.</p>
  </>} />
}
