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
    { label: 'Single vertex', input: '{"n":1,"edges":[]}' },
    { label: 'Shared target', input: '{"n":3,"edges":[[0,2],[1,2]]}' },
    { label: 'Largest: 30 vertices', input: '{"n":30,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24],[24,25],[25,26],[26,27],[27,28],[28,29],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,8],[7,9],[8,10],[9,11],[10,12],[11,13],[12,14],[13,15],[14,16],[15,17],[16,18],[17,19],[18,20],[19,21],[20,22],[21,23],[22,24],[23,25],[24,26],[25,27],[26,28],[27,29]]}' },
    { label: 'Long run: 30 vertices', input: '{"n":30,"edges":[[10,27],[24,28],[3,10],[5,14],[0,16],[8,25],[26,27],[27,29],[23,29],[26,28],[13,26],[23,25],[8,12],[2,18],[7,8],[1,27],[11,21],[2,25],[14,23],[17,20],[15,17],[0,11],[11,24],[21,24],[23,27],[19,28],[2,11],[19,22],[1,26],[12,19],[0,13],[7,22],[28,29],[13,16],[12,16],[25,26],[24,27],[17,24],[11,18],[4,5]]}' },
  ],
}

export default function MinimumStartingVertices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, edges } = run.input
    const { indegree, edge, sources } = step.snapshot
    const sourceSet = new Set(sources)
    const counted = step.phase === 'start' ? [] : edge
      ? edges.slice(0, edges.findIndex(([a, b]) => a === edge[0] && b === edge[1]) + 1)
      : edges
    const prerequisites = Array.from({ length: n }, (_, v) => counted.filter(([, to]) => to === v).map(([from]) => from))
    return <>
      <section aria-label="Prerequisite map">
        <h3>Each vertex's incoming arrows (its prerequisites, the vertices that point to it)</h3>
        <table>
          <thead><tr><th scope="col">vertex</th><th scope="col">prerequisites so far</th><th scope="col">status</th></tr></thead>
          <tbody>{prerequisites.map((list, v) => <tr key={v} data-vertex={v} style={edge && edge[1] === v ? { background: 'var(--surface2)', fontWeight: 600 } : undefined}>
            <td>{v}</td>
            <td>{list.length ? list.join(', ') : 'none'}</td>
            <td>{step.phase === 'collect' || step.phase === 'done' ? (sourceSet.has(v) ? 'start here' : 'reached from a prerequisite') : 'still being counted'}</td>
          </tr>)}</tbody>
        </table>
      </section>
      <div role="img" aria-label="Vertices with incoming arrow counts" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Array.from({ length: n }, (_, v) => {
          const isSource = sourceSet.has(v)
          const isTarget = edge && edge[1] === v
          return <div key={v} data-vertex={v} style={{
            minWidth: 64, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${isSource || isTarget ? 2 : 1}px solid ${isSource ? 'var(--primary)' : 'var(--border)'}`,
            background: isSource ? 'var(--surface2)' : isTarget ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
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
