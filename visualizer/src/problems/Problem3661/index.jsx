import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function WallLine({ run, step }) {
  const pts = [...run.positions.map(p => p.x ?? p), ...run.input.walls.map(w => w.x ?? w)]
  const lo = Math.min(0, ...pts), hi = Math.max(1, ...pts)
  const W = 560, scale = v => 30 + ((v - lo) / Math.max(1, hi - lo)) * (W - 60)
  return <svg viewBox={`0 0 ${W} 90`} role="img" aria-label="Robots and walls on one line" style={{ width: '100%', maxWidth: W }}>
    <line x1={30} y1={50} x2={W - 30} y2={50} stroke="var(--text)" strokeOpacity="0.4" />
    {run.input.walls.map((w, i) => { const x = w.x ?? w; return <rect key={`w${i}`} x={scale(x) - 3} y={36} width={6} height={28} fill="var(--text)" /> })}
    {run.positions.map((p, i) => { const x = p.x ?? p; return <g key={`r${i}`}>
      <circle cx={scale(x)} cy={50} r={9} fill={step.robot === i ? 'var(--primary)' : 'var(--surface2)'} stroke="var(--text)" />
      <text x={scale(x)} y={80} textAnchor="middle" fontSize="11" fill="var(--text)">R{i + 1}</text>
    </g> })}
  </svg>
}

const definition = {
  number: '3661',
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the robots left to right.' },
    { id: 'first', label: 'First robot', description: 'Its bullets cover walls with no neighbour in the way.' },
    { id: 'step', label: 'Next robot', description: 'Try both directions and remove any double-counted overlap.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with robots, distance and walls (positions and reaches)',
  url: 'https://leetcode.com/problems/maximum-walls-destroyed-by-robots/',
  complexity: 'Sorting plus a two-state DP over the robots. Each interval count scans the walls in this teaching version.',
  examples: [
    { label: 'Three robots', input: '{"robots":[6,15,20],"distance":[4,3,2],"walls":[3,5,9,18,21,22]}' },
    { label: 'Blocked shot', input: '{"robots":[2,9],"distance":[9,1],"walls":[4,5,12]}' },
    { label: 'One robot, one wall', input: '{"robots":[1],"distance":[1],"walls":[2]}' },
    { label: 'Equal distances', input: '{"robots":[10,20],"distance":[5,5],"walls":[15,25]}' },
    { label: 'Extreme positions', input: '{"robots":[1,50],"distance":[10,10],"walls":[50,1]}' },
    { label: 'Long run: 5 robots, 12 walls', input: '{"robots":[13,22,38,9,2],"distance":[1,6,9,5,9],"walls":[38,22,47,43,35,1,16,41,18,37,25,12]}' },
  ],
}

export default function MaximumWallsDestroyedByRobots() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <WallLine run={run} step={step} />
    <section className="algorithm-sequence" aria-label="Robot ranges">
      <h3>Robots from left to right</h3>
      <table>
        <thead><tr><th scope="col">Robot</th><th scope="col">Position</th><th scope="col">Left bullet</th><th scope="col">Right bullet</th></tr></thead>
        <tbody>{run.positions.map((p, i) => <tr key={i} data-current={step.robot === i}>
          <th scope="row">{i + 1}</th><td>{p}</td>
          <td>{step.robot === i ? step.ranges[0] : '-'}</td>
          <td>{step.robot === i ? step.ranges[1] : '-'}</td>
        </tr>)}</tbody>
      </table>
    </section>
    {step.options.length > 0 && <ul aria-label="Options for this robot">{step.options.map(o => <li key={o.side}>
      {o.side === 0 ? 'Fire left' : 'Fire right'} over {o.range} covers {o.walls} walls: {o.choices.map(c => `after ${c.prevSide === 0 ? 'left' : 'right'} ${c.value}${c.overlap ? ` (overlap ${c.overlap})` : ''}`).join(', ')}
    </li>)}</ul>}
    <output aria-label="Best totals">Best ending left: {step.best[0]}, ending right: {step.best[1]}{step.result !== null ? ` · Answer ${step.result}` : ''}</output>
  </>} renderReasoning={() => <>
    <p>A bullet is stopped by the nearest robot on its side, so each robot's reach depends only on its neighbours' positions.</p>
    <p>Two neighbouring bullets can overlap only between their two robots. Subtracting that overlap keeps every wall counted once.</p>
  </>} />
}
