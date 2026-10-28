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
    { label: 'Example 1', input: '{"n":3,"edges":[[0,1,1],[1,2,2]],"k":2,"t":4}' },
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1,2],[0,2,3]],"k":1,"t":3}' },
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
