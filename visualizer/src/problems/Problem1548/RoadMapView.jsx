import './RoadMapView.css'

const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 110

// The road network on a circle. Roads on the walk so far are gold, the vertex being extended is amber.
export default function RoadMapView({ run, step }) {
  const { n, roads, names } = run.input
  const at = v => {
    const angle = (2 * Math.PI * v) / n - Math.PI / 2
    return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) }
  }
  const route = (step.route || []).filter(v => v >= 0)
  const walked = new Set()
  for (let k = 1; k < route.length; k++) walked.add([route[k - 1], route[k]].sort((a, b) => a - b).join('-'))
  return (
    <figure className="rm-view">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Road network with the walk so far">
        {roads.map(([a, b]) => {
          const p = at(a), q = at(b)
          const key = [a, b].sort((x, y) => x - y).join('-')
          return <line key={key} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={walked.has(key) ? 'rm-road rm-road--walk' : 'rm-road'} />
        })}
        {names.map((name, v) => {
          const p = at(v)
          const cls = v === step.v && step.phase === 'cell' ? 'rm-node rm-node--now' : route.includes(v) ? 'rm-node rm-node--route' : 'rm-node'
          return (
            <g key={v}>
              <circle cx={p.x} cy={p.y} r={20} className={cls} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className="rm-text">{name}</text>
            </g>
          )
        })}
      </svg>
      <figcaption>Roads on the walk are gold. Each target position picks a neighbour, and the walk follows those choices back.</figcaption>
    </figure>
  )
}
