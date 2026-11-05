import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '973',
  title: 'K Closest Points to Origin',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points: a list of [x, y] pairs, and k: how many to keep',
  url: 'https://leetcode.com/problems/k-closest-points-to-origin/',
  complexity: 'O(n log n) to sort the distances. A selection method could reach O(n) on average.',
  examples: [
    { label: 'Nearest of two', input: JSON.stringify({ points: [[4, 1], [-2, -2]], k: 1 }) },
    { label: 'Three points, keep two', input: JSON.stringify({ points: [[2, 6], [-5, 1], [4, -4]], k: 2 }) },
    { label: 'Scattered points', input: JSON.stringify({ points: [[8, 2], [1, 0], [-4, 5], [0, -6], [3, 3]], k: 3 }) },
  ],
}

export default function Problem973() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { points } = run.input
    const extent = Math.max(4, ...points.flat().map(Math.abs)) + 1
    const ring = Math.sqrt(run.radius)
    return <section aria-label="Points on the plane" style={{ display: 'grid', gap: 8 }}>
      <svg viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`} role="img" aria-label="Plane with points and the k-distance circle"
        style={{ width: '100%', maxWidth: 340, height: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
        <line x1={-extent} y1={0} x2={extent} y2={0} style={{ stroke: 'var(--border)', strokeWidth: 0.2 }} />
        <line x1={0} y1={-extent} x2={0} y2={extent} style={{ stroke: 'var(--border)', strokeWidth: 0.2 }} />
        <circle cx={0} cy={0} r={ring} style={{ fill: 'none', stroke: 'var(--primary)', strokeWidth: 0.3, strokeDasharray: '1 1' }} />
        {points.map((point, i) => {
          const chosen = step.chosen.includes(i)
          const current = step.current === i
          return <g key={i}>
            <circle cx={point[0]} cy={-point[1]} r={current ? 1.1 : 0.8}
              style={{ fill: chosen ? 'var(--primary)' : 'var(--surface2)', stroke: 'var(--text-muted)', strokeWidth: 0.2 }} />
            <text x={point[0] + 1.2} y={-point[1] - 1} style={{ fill: 'var(--text)', fontSize: 2.2 }}>{`${point[0]},${point[1]}`}</text>
          </g>
        })}
      </svg>
      {step.order && <ol aria-label="Points ordered by distance" style={{ margin: 0, paddingLeft: 20, color: 'var(--text)' }}>
        {step.order.map(i => <li key={i} style={{ fontWeight: step.chosen.includes(i) ? 700 : 400 }}>
          [{points[i][0]}, {points[i][1]}] squared distance {points[i][0] ** 2 + points[i][1] ** 2}{step.chosen.includes(i) ? ' · kept' : ''}
        </li>)}
      </ol>}
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>The dashed circle reaches the k-th closest point. Filled points are kept.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
