import './TripGraphView.css'

const SIZE = 300
const C = SIZE / 2
const R = 105

// Cities on a ring. Visited cities of the current trip are blue, the trip's end is gold,
// the highway being extended is orange and the best complete trip is green.
export default function TripGraphView({ run, step }) {
  const { n, edges } = run.input
  const pos = i => [C + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), C + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)]
  const bestEdges = new Set()
  for (let i = 0; i + 1 < step.bestPath.length; i++) bestEdges.add(`${step.bestPath[i]}-${step.bestPath[i + 1]}`)
  const isBest = (a, b) => bestEdges.has(`${a}-${b}`) || bestEdges.has(`${b}-${a}`)
  const isCurrent = (a, b) => step.from !== null && step.to !== null && ((a === step.from && b === step.to) || (a === step.to && b === step.from))
  const visited = i => ((step.mask >> i) & 1) === 1
  return (
    <div className="trip-view">
      <svg className="trip-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Cities and highways">
        {edges.map(([a, b, cost], k) => {
          const [x1, y1] = pos(a)
          const [x2, y2] = pos(b)
          const cls = isCurrent(a, b) ? 'trip-edge--current' : isBest(a, b) ? 'trip-edge--best' : 'trip-edge'
          return <g key={k}>
            <line className={cls} x1={x1} y1={y1} x2={x2} y2={y2} />
            <text className="trip-label" x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4}>{cost}</text>
          </g>
        })}
        {Array.from({ length: n }, (_, i) => {
          const [x, y] = pos(i)
          const cls = step.from === i ? 'trip-node trip-node--end' : visited(i) ? 'trip-node trip-node--visited' : 'trip-node'
          return <g key={i}><circle className={cls} cx={x} cy={y} r={16} /><text x={x} y={y + 4} textAnchor="middle" fontSize="13">{i}</text></g>
        })}
      </svg>
      <p className="trip-caption">Cities in the current trip mask: {[...Array(n).keys()].filter(visited).join(', ') || 'none'}. Current total: {step.value ?? '-'}.</p>
      <p className="trip-text">Best complete trip with k = {run.input.k}: {step.bestValue === null || step.bestValue === undefined ? 'none yet' : step.bestValue}.</p>
    </div>
  )
}
