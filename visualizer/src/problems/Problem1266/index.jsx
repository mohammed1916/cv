import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1266',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Points as a JSON array of [x, y] pairs',
  url: 'https://leetcode.com/problems/minimum-time-visiting-all-points/',
  complexity: 'O(n) time for n points, checking each consecutive leg once. O(1) extra space.',
  examples: [
    { label: 'Three points', input: '[[0,0],[3,1],[1,5]]' },
    { label: 'Diagonal', input: '[[-2,2],[2,-2]]' },
    { label: 'Four points', input: '[[1,1],[4,1],[4,7],[0,0]]' },
  ],
}

export default function MinimumTimeVisitingAllPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { points, leg, from, to, dx, dy, moves, total } = step.snapshot
    return <>
      <ol aria-label="Points in visiting order" style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {points.map((p, i) => {
          const active = i === leg || i === leg + 1
          return <li key={i} style={{ border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`, padding: '4px 8px' }}>
            [{p[0]}, {p[1]}]
          </li>
        })}
      </ol>
      {from && to && <table aria-label="Current leg" style={{ marginTop: 12, fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><th>from → to</th><td>[{from[0]}, {from[1]}] → [{to[0]}, {to[1]}]</td></tr>
          <tr><th>dx, dy</th><td>{dx}, {dy}</td></tr>
          <tr><th>cost max(dx, dy)</th><td>{moves}</td></tr>
          <tr><th>running total</th><td>{total}</td></tr>
        </tbody>
      </table>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Diagonal first:</strong> one move can change x and y together. Between two points, the cost is the larger of the two gaps: the diagonal covers the smaller gap for free.</p>
    <p><strong>Legs add up:</strong> the points must be visited in order, so the total is the sum of the leg costs.</p>
  </>} />
}
