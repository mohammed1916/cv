import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3809,
  phases: [
    { id: 'check', label: 'Range', description: 'Measure each tower with the Manhattan distance.' },
    { id: 'best', label: 'Best', description: 'Replace the best tower when quality, then coordinate, is better.' },
    { id: 'done', label: 'Result', description: 'Report the chosen coordinate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with towers ([x, y, q] rows), center and radius',
  url: 'https://leetcode.com/problems/best-reachable-tower/',
  complexity: 'O(n) time: one distance check and one comparison per tower.',
  examples: [
    { label: 'Tie break', input: '{"towers":[[1,3,5],[2,2,5],[9,9,30]],"center":[0,0],"radius":5}' },
    { label: 'Nothing reachable', input: '{"towers":[[10,10,3]],"center":[0,0],"radius":4}' },
    { label: 'One tower in range', input: '{"towers":[[0,0,1]],"center":[0,0],"radius":0}' },
    { label: 'Equal distances', input: '{"towers":[[1,0,4],[0,1,4]],"center":[0,0],"radius":1}' },
    { label: 'Twelve towers, maximum radius', input: '{"towers":[[1,30,30],[3,29,30],[5,28,30],[7,27,30],[9,26,30],[11,25,30],[13,24,30],[15,23,30],[17,22,30],[19,21,30],[21,20,30],[23,19,30]],"center":[15,15],"radius":60}' },
    { label: 'Long run: 12 towers', input: '{"towers":[[15,20,29],[3,30,3],[22,14,3],[19,26,6],[29,21,4],[6,20,5],[8,9,5],[22,5,29],[0,29,29],[1,8,27],[2,25,21],[3,25,11]],"center":[0,30],"radius":20}' },
  ],
}

const CELL = 22, PAD = 26

// The plane shows the reach diamond (every point at Manhattan distance `radius` from the center).
function ReachPlane({ towers, center, radius, current, best }) {
  const xs = [...towers.map(t => t[0]), center[0] + radius, center[0] - radius, 0]
  const ys = [...towers.map(t => t[1]), center[1] + radius, center[1] - radius, 0]
  const x0 = Math.min(0, ...xs), x1 = Math.max(6, ...xs)
  const y0 = Math.min(0, ...ys), y1 = Math.max(6, ...ys)
  const at = (x, y) => ({ x: PAD + (x - x0) * CELL, y: PAD + (y1 - y) * CELL })
  const width = PAD * 2 + (x1 - x0) * CELL, height = PAD * 2 + (y1 - y0) * CELL
  const c = at(center[0], center[1])
  const diamond = [[center[0] + radius, center[1]], [center[0], center[1] + radius], [center[0] - radius, center[1]], [center[0], center[1] - radius]]
    .map(([x, y]) => at(x, y)).map(p => `${p.x},${p.y}`).join(' ')
  return <svg className="reach-plane" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img"
    aria-label={`Plane with center (${center[0]}, ${center[1]}) and reach radius ${radius}`}>
    <polygon points={diamond} fill="var(--surface2)" stroke="var(--primary)" strokeDasharray="4 3" />
    {towers.map(([x, y, q], i) => {
      const p = at(x, y)
      const reachable = Math.abs(x - center[0]) + Math.abs(y - center[1]) <= radius
      const isBest = best && best[0] === x && best[1] === y
      const isCurrent = current === i
      return <g key={i}>
        <circle cx={p.x} cy={p.y} r={isCurrent ? 9 : 7} fill={reachable ? 'var(--primary)' : 'var(--surface2)'}
          stroke={isBest ? 'var(--text)' : 'var(--text-muted)'} strokeWidth={isBest || isCurrent ? 3 : 1} />
        <text x={p.x + 10} y={p.y - 8} fontSize="11" fill="var(--text)">{i}: q{q}</text>
      </g>
    })}
    <circle cx={c.x} cy={c.y} r="5" fill="var(--text)" />
    <text x={c.x + 8} y={c.y + 14} fontSize="11" fill="var(--text)">center</text>
  </svg>
}

export default function BestReachableTower() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ReachPlane towers={run.input.towers} center={run.input.center} radius={run.input.radius} current={step.at} best={step.best} />
    <table aria-label="Towers">
      <thead><tr><th>index</th><th>x, y</th><th>quality</th><th>distance to center</th><th>state</th></tr></thead>
      <tbody>{run.input.towers.map(([x, y, q], i) => {
        const distance = Math.abs(x - run.input.center[0]) + Math.abs(y - run.input.center[1])
        const reachable = distance <= run.input.radius
        return <tr key={i} data-current={step.at === i ? 'yes' : undefined}>
          <td>{i}</td><td>{x}, {y}</td><td>{q}</td><td>{distance}</td><td>{reachable ? 'reachable' : 'out of range'}</td>
        </tr>
      })}</tbody>
    </table>
    <output aria-label="Best so far">{step.best ? `best (${step.best[0]}, ${step.best[1]})` : 'no best yet'}{` · center (${run.input.center[0]}, ${run.input.center[1]}), radius ${run.input.radius}`}</output>
  </>} renderReasoning={() => <>
    <p>The dashed diamond is every point whose Manhattan distance from the center equals the radius. Towers inside or on it are reachable.</p>
    <p>Among reachable towers, a higher quality wins. An equal quality is settled by the smaller x, then the smaller y.</p>
  </>} />
}
