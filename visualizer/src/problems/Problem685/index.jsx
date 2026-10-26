import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Edges', description: 'Scan the edges in input order.' },
    { id: 'conflict', label: 'Two parents', description: 'Record the two conflicting edges.' },
    { id: 'union', label: 'Union', description: 'Join the endpoints of a kept edge.' },
    { id: 'cycle', label: 'Cycle', description: 'An edge closes a loop.' },
    { id: 'done', label: 'Complete', description: 'Report the edge to remove.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Edges (JSON array of [u, v])',
  url: 'https://leetcode.com/problems/redundant-connection-ii/',
  complexity: 'O(n α(n)) time for union-find over n edges, and O(n) space.',
  examples: [
    { label: 'Two parents', input: '[[1,2],[1,3],[2,3]]' },
    { label: 'Cycle', input: '[[1,2],[2,3],[3,4],[4,1],[1,5]]' },
  ],
}

export default function RedundantConnectionII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Edges">
      <thead><tr><th>#</th><th>Edge</th><th>Role</th></tr></thead>
      <tbody>{run.input.map(([u, v], i) => {
        const isRemoved = step.removed === i
        const isCandidate = step.candidates?.includes(i)
        const current = step.index === i
        return <tr key={i} style={{ fontWeight: current ? 700 : 400, color: isRemoved ? 'var(--error)' : 'var(--text)' }}>
          <td>{i}</td><td>{u} → {v}</td><td>{isRemoved ? 'remove' : isCandidate ? 'candidate' : ''}</td>
        </tr>
      })}</tbody>
    </table>
    <output aria-label="Result">{step.phase === 'done' ? `Remove [${run.result.join(', ')}]` : `Scanning edge ${step.index}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Two cases:</strong> a node with two parents means one of its two edges must go; a cycle means some edge on it must go. Union-find tells which.</p>
  </>} />
}
