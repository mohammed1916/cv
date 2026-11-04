const TYPE_COLOUR = { 1: 'var(--info)', 2: 'var(--warning)', 3: 'var(--primary)' }
const TYPE_LABEL = { 1: 'Alice only', 2: 'Bob only', 3: 'both' }

// Nodes sit on a circle. Edge colour shows who may use it; solid means kept, dashed means removed.
export default function EdgeTypesView({ n, edges, decisions, activeEdge }) {
  const size = 260
  const radius = 100
  const point = node => {
    const angle = (2 * Math.PI * (node - 1)) / n - Math.PI / 2
    return { x: size / 2 + radius * Math.cos(angle), y: size / 2 + radius * Math.sin(angle) }
  }
  return <figure aria-label="Graph with edge types" style={{ margin: 0 }}>
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 300 }} role="img" aria-label="Nodes and edges">
      {edges.map(([t, u, v], index) => {
        const a = point(u)
        const b = point(v)
        const decision = decisions[index]
        const active = index === activeEdge
        return <line key={index} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={TYPE_COLOUR[t]} strokeWidth={active ? 5 : 2.5}
          strokeDasharray={decision === 'removed' ? '6 5' : undefined}
          opacity={decision === 'pending' ? 0.35 : decision === 'removed' ? 0.45 : 1} data-edge={index} />
      })}
      {Array.from({ length: n }, (_, i) => i + 1).map(node => {
        const p = point(node)
        return <g key={node}>
          <circle cx={p.x} cy={p.y} r={16} fill="var(--surface)" stroke="var(--text)" strokeWidth={1.5} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="monospace">{node}</text>
        </g>
      })}
    </svg>
    <figcaption style={{ color: 'var(--text-muted)' }}>
      {Object.entries(TYPE_LABEL).map(([t, label]) => <span key={t} style={{ marginRight: 12 }}>
        <span style={{ display: 'inline-block', width: 14, height: 4, background: TYPE_COLOUR[t], verticalAlign: 'middle', marginRight: 4 }} />type {t}: {label}
      </span>)}
      <br />Solid lines are kept; dashed lines are removed.
    </figcaption>
  </figure>
}
