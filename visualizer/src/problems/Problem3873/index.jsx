import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Coordinates', description: 'Each x and y value starts alone.' },
    { id: 'join', label: 'Join', description: 'Each point links its x value with its y value.' },
    { id: 'count', label: 'Count', description: 'Pick the two largest groups.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points (distinct [x, y] pairs)',
  url: 'https://leetcode.com/problems/maximum-points-activated-with-one-addition/',
  complexity: 'Joining groups costs near-linear time in the number of points. The visual caps the input at 12 points.',
  examples: [
    { label: 'Example', input: '{"points":[[0,0],[0,5],[7,5],[9,9]]}' },
    { label: 'Two singles', input: '{"points":[[0,0],[1,1]]}' },
  ],
}

const PALETTE = ['var(--primary)', 'var(--text)', 'var(--text-muted)', 'var(--surface2)']

// Bipartite picture: x values on the left, y values on the right, each point is an edge.
// Edges and labels take the colour of their activation group, so the groups are visible at a glance.
function Bipartite({ points, groups }) {
  const xs = [...new Set(points.map(p => p[0]))].sort((a, b) => a - b)
  const ys = [...new Set(points.map(p => p[1]))].sort((a, b) => a - b)
  const width = 360, rowGap = 40, top = 30
  const height = Math.max(xs.length, ys.length) * rowGap + top
  const xy = new Map(xs.map((x, i) => [`x${x}`, { x: 70, y: top + i * rowGap }]))
  ys.forEach((y, i) => xy.set(`y${y}`, { x: width - 70, y: top + i * rowGap }))
  const groupOf = (x, y) => groups.findIndex(g => g.some(([gx, gy]) => gx === x && gy === y))
  return <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width }} role="img" aria-label="Points as edges between x values and y values">
    {points.map(([x, y], i) => {
      const a = xy.get(`x${x}`), b = xy.get(`y${y}`)
      const g = groupOf(x, y)
      return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={g >= 0 ? PALETTE[g % PALETTE.length] : 'var(--surface2)'} strokeWidth={g >= 0 ? 3 : 1} />
    })}
    {xs.map(x => <g key={`x${x}`}><circle cx={70} cy={xy.get(`x${x}`).y} r="12" fill="var(--surface2)" stroke="var(--text)" /><text x={70} y={xy.get(`x${x}`).y + 4} textAnchor="middle" fontSize="11" fill="var(--text)">{x}</text></g>)}
    {ys.map(y => <g key={`y${y}`}><circle cx={width - 70} cy={xy.get(`y${y}`).y} r="12" fill="var(--surface2)" stroke="var(--text)" /><text x={width - 70} y={xy.get(`y${y}`).y + 4} textAnchor="middle" fontSize="11" fill="var(--text)">{y}</text></g>)}
    <text x={70} y={14} textAnchor="middle" fontSize="11" fill="var(--text)">x values</text>
    <text x={width - 70} y={14} textAnchor="middle" fontSize="11" fill="var(--text)">y values</text>
  </svg>
}

export default function MaximumPointsActivatedWithOneAddition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Bipartite points={run.input.points} groups={step.groups} />
    <ul aria-label="Activation groups">{step.groups.map((group, index) => <li key={index} data-role="window">
      <strong>Group {index + 1}</strong>: {group.map(([x, y]) => `(${x}, ${y})`).join(' ')}</li>)}</ul>
    <output aria-label="Best total">{step.best === null ? `Groups so far: ${step.groups.length}` : `Best activation count: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Two points on the same vertical or horizontal line pass activation along, so any chain of such links ends up in one cluster. In the picture, a point is an edge and a cluster is a connected set of edges.</p>
    <p>Adding a point at a chosen x and y links two groups, and the activated total is their sizes plus the new point, so the best choice uses the two largest groups.</p>
  </>} />
}
