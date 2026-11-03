import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1557',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-vertices-to-reach-all-nodes/',
  complexity: 'O(n + m) time and O(n) space: one pass over the edges to count arrivals, then one pass over the vertices.',
  examples: [
    { label: 'Mixed sources', input: '{"n":6,"edges":[[0,2],[1,2],[2,3],[4,5]]}' },
    { label: 'Single chain', input: '{"n":4,"edges":[[3,2],[2,1],[1,0]]}' },
    { label: 'No edges', input: '{"n":3,"edges":[]}' },
  ],
}

export default function MinimumStartingVertices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, edges } = run.input
    const { indegree, edge, sources } = step.snapshot
    const sourceSet = new Set(sources)
    return <>
      <div role="img" aria-label="Vertices with incoming arrow counts" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Array.from({ length: n }, (_, v) => {
          const isSource = sourceSet.has(v)
          const isTarget = edge && edge[1] === v
          return <div key={v} data-vertex={v} style={{
            minWidth: 64, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${isSource || isTarget ? 2 : 1}px solid ${isSource ? '#0891b2' : 'var(--border)'}`,
            background: isSource ? '#a5f3fc' : isTarget ? 'var(--surface2)' : 'transparent', color: '#1c1917',
          }}><div>vertex {v}</div><small>arrows in: {indegree[v]}</small></div>
        })}
      </div>
      <p>{edge ? `Counting edge ${edge[0]} to ${edge[1]}.` : 'No edge is being counted.'}</p>
      <p>Edges: {edges.map(([a, b]) => `${a} to ${b}`).join(', ') || 'none'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> a vertex with an incoming arrow can be reached from its predecessor, so only vertices with no arrows in must be chosen.</p>
    <p><strong>Why it suffices:</strong> in a directed acyclic graph, following arrows backwards from any vertex must stop at a vertex with no arrows in, so those sources reach everything.</p>
  </>} />
}
