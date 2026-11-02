import './RouteGraphView.css'

const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 110

export default function RouteGraphView({ run, step }) {
  const { n, edges } = run.input
  const pos = Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    return [CENTER + RADIUS * Math.cos(angle), CENTER + RADIUS * Math.sin(angle)]
  })
  const nodeClass = node => {
    const parts = ['rgv__node']
    if (node === step.destination) parts.push('rgv__node--dest')
    if (node === step.source) parts.push('rgv__node--source')
    if (step.path.includes(node)) parts.push('rgv__node--path')
    else if (step.mark[node] === 2) parts.push('rgv__node--good')
    if (node === step.current && step.verdict === false) parts.push('rgv__node--bad')
    if (node === step.current) parts.push('rgv__node--now')
    return parts.join(' ')
  }
  return (
    <figure className="rgv" aria-label="Directed graph with the current search path highlighted">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="rgv__svg" role="img" aria-label="Graph nodes and edges">
        <defs>
          <marker id="rgv-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="rgv__arrowhead" />
          </marker>
        </defs>
        {edges.map(([u, v], index) => {
          const [x1, y1] = pos[u]; const [x2, y2] = pos[v]
          const active = step.edge && step.edge[0] === u && step.edge[1] === v
          const loop = u === v
          if (loop) {
            const [cx, cy] = [x1 + 0, y1 - 26]
            return <path key={index} className={`rgv__edge${active ? ' rgv__edge--active' : ''}`} d={`M ${x1 - 8} ${y1 - 16} C ${cx - 30} ${cy - 30}, ${cx + 30} ${cy - 30}, ${x1 + 8} ${y1 - 16}`} markerEnd="url(#rgv-arrow)" />
          }
          return <line key={index} className={`rgv__edge${active ? ' rgv__edge--active' : ''}`} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#rgv-arrow)" />
        })}
        {pos.map(([x, y], node) => (
          <g key={node} className={nodeClass(node)}>
            <circle cx={x} cy={y} r="18" />
            <text x={x} y={y + 5} textAnchor="middle">{node}</text>
            {node === step.destination && <text x={x} y={y - 24} textAnchor="middle" className="rgv__tag">dest</text>}
            {node === step.source && <text x={x} y={y + 34} textAnchor="middle" className="rgv__tag">src</text>}
          </g>
        ))}
      </svg>
      <div className="rgv__panel">
        <p><strong>Current path:</strong> {step.path.length ? step.path.join(' → ') : 'empty'}</p>
        <p><strong>Legend:</strong> blue = on path, green = proven good, amber outline = current node, red = rejected.</p>
        {step.verdict !== null && <p role="status">{step.verdict ? '✓ this branch is good' : '✕ this branch fails'}</p>}
      </div>
    </figure>
  )
}
