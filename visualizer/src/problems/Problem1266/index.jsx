import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
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
    { label: 'Single point', input: '[[0,0]]' },
    { label: 'Collinear points', input: '[[0,0],[1,1],[2,2]]' },
    { label: 'Corners of the square', input: '[[-100,-100],[100,100],[100,-100],[-100,100]]' },
    { label: 'Long run: 10 points', input: '[[36,-82],[-60,39],[75,0],[5,2],[42,41],[-86,-65],[-70,-25],[93,34],[-16,64],[66,99]]' },
  ],
}

export default function MinimumTimeVisitingAllPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { points, leg, from, to, dx, dy, moves, total } = step.snapshot
    const planePoints = points.map(([x, y], i) => ({
      x, y, label: String(i + 1),
      role: i === leg || i === leg + 1 ? 'active' : leg >= 0 && i < leg + 1 ? 'kept' : '',
    }))
    return <>
      <CoordinatePlane title="Points in visiting order" points={planePoints} />
      <ol aria-label="Points in visiting order" style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {points.map((p, i) => {
          const active = i === leg || i === leg + 1
          return <li key={i} style={{ border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`, padding: '4px 8px', color: 'var(--text)' }}>
            [{p[0]}, {p[1]}]
          </li>
        })}
      </ol>
      {from && to && <table aria-label="Current leg" style={{ marginTop: 12, fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><th scope="row">From to</th><td>[{from[0]}, {from[1]}] to [{to[0]}, {to[1]}]</td></tr>
          <tr><th scope="row">dx, dy</th><td>{dx}, {dy}</td></tr>
          <tr><th scope="row">max(dx, dy)</th><td>{moves}</td></tr>
        </tbody>
      </table>}
      <output aria-label="Total time" style={{ display: 'block', marginTop: 8 }}>{`Total time so far: ${total}`}</output>
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
