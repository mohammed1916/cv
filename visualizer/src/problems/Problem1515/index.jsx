import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Average', description: 'Start at the average of the points.' },
    { id: 'step', label: 'Move', description: 'Move to the distance-weighted average of the points.' },
    { id: 'done', label: 'Complete', description: 'Report the total distance from the final point.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with positions, a list of [x, y] pairs (JSON)',
  url: 'https://leetcode.com/problems/best-position-for-a-service-centre/',
  complexity: 'O(n * iterations) time with a fixed iteration count. The visualization caps input at 8 points.',
  examples: [
    { label: 'Square', input: '{"positions":[[0,0],[0,2],[2,0],[2,2]]}' },
    { label: 'Two points', input: '{"positions":[[0,0],[10,0]]}' },
  ],
}

const W = 320, H = 260, PAD = 28

// Plot of the service points, the candidate's path so far, and the distance lines from the candidate.
function Plot({ points, path, current }) {
  const xs = [...points.map(p => p[0]), ...path.map(p => p.x)]
  const ys = [...points.map(p => p[1]), ...path.map(p => p.y)]
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const spanX = maxX - minX || 1, spanY = maxY - minY || 1
  const sx = x => PAD + ((x - minX) / spanX) * (W - 2 * PAD)
  const sy = y => H - PAD - ((y - minY) / spanY) * (H - 2 * PAD)
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Service points and the candidate centre" style={{ width: '100%', maxWidth: W, height: 'auto', color: 'var(--text)' }}>
    <rect x={0} y={0} width={W} height={H} style={{ fill: 'var(--surface)' }} />
    {points.map(([px, py], i) => <line key={`d${i}`} x1={sx(px)} y1={sy(py)} x2={sx(current.x)} y2={sy(current.y)}
      style={{ stroke: 'var(--border)', strokeDasharray: '4 3' }} />)}
    {path.length > 1 && <polyline points={path.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ')} style={{ fill: 'none', stroke: 'var(--primary)', strokeWidth: 2 }} />}
    {points.map(([px, py], i) => <g key={`p${i}`}>
      <circle cx={sx(px)} cy={sy(py)} r={6} style={{ fill: 'var(--primary)' }} />
      <text x={sx(px) + 8} y={sy(py) - 6} style={{ fill: 'var(--text)', fontSize: 11, fontFamily: 'monospace' }}>{i}</text>
    </g>)}
    <circle cx={sx(current.x)} cy={sy(current.y)} r={7} style={{ fill: 'none', stroke: 'var(--text)', strokeWidth: 3 }} />
  </svg>
}

export default function ServiceCentre() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const upto = run.frames.indexOf(step)
    const path = run.frames.slice(0, upto + 1).map(f => ({ x: f.x, y: f.y }))
    return <>
      <section aria-label="Plot of service points">
        <h3>Service points and the candidate centre (its path so far is the line)</h3>
        <Plot points={run.input.positions} path={path} current={step} />
      </section>
      <table aria-label="Service points">
        <thead><tr><th scope="col">Point</th><th scope="col">Distance to candidate</th></tr></thead>
        <tbody>{run.input.positions.map(([px, py], i) => <tr key={i}>
          <td>{`(${px}, ${py})`}</td>
          <td>{Math.hypot(px - step.x, py - step.y).toFixed(3)}</td>
        </tr>)}</tbody>
      </table>
      <output aria-label="Candidate">{`Candidate (${step.x.toFixed(3)}, ${step.y.toFixed(3)}), total distance ${step.sum.toFixed(4)}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The total distance is convex, so any local improvement points toward the single minimum, the geometric median.</p>
    <p>Weiszfeld's update moves to the average of the points weighted by inverse distance, which lowers the total at each step.</p>
  </>} />
}
