// Small subset-enumeration graphs: keep every node and edge visible, never use
// values as identity (many nodes may have identical values).
export default function InducedGraph({ values, edges, mask, reached = 0, active = -1 }) {
  const points = values.map((_, i) => {
    const angle = 2 * Math.PI * i / values.length - Math.PI / 2
    return { x: 270 + 195 * Math.cos(angle), y: 250 + 195 * Math.sin(angle) }
  })
  return <section aria-label="Induced subgraph" className="algorithm-path__viewport">
    <svg viewBox="0 0 540 500" width="100%" style={{ minWidth: 360 }} role="img" aria-label="Selected nodes and induced edges; dashed edges are excluded">
      {edges.map(([u, v]) => {
        const kept = Boolean(mask & (1 << u)) && Boolean(mask & (1 << v))
        return <line key={`${u},${v}`} x1={points[u].x} y1={points[u].y} x2={points[v].x} y2={points[v].y}
          data-edge={`${u},${v}`} data-role={kept ? 'retained' : 'excluded'} stroke="currentColor" strokeWidth={kept ? 3 : 1}
          opacity={kept ? 1 : .25} strokeDasharray={kept ? undefined : '5 5'} />
      })}
      {values.map((value, i) => {
        const selected = Boolean(mask & (1 << i)), discovered = Boolean(reached & (1 << i))
        return <g key={i} data-node={i} data-role={discovered ? 'reached' : selected ? 'selected' : 'excluded'}>
          <circle cx={points[i].x} cy={points[i].y} r={24} fill="var(--surface)" stroke={selected ? 'var(--primary)' : 'currentColor'}
            strokeWidth={i === active ? 5 : selected ? 3 : 1} strokeDasharray={selected ? undefined : '3 3'} />
          <text x={points[i].x} y={points[i].y - 2} textAnchor="middle" fill="currentColor" fontSize={12}>node {i}</text>
          <text x={points[i].x} y={points[i].y + 13} textAnchor="middle" fill="currentColor" fontSize={12}>value {value}</text>
          <text x={points[i].x} y={points[i].y + 39} textAnchor="middle" fill="currentColor" fontSize={10}>{i === active ? 'visiting' : discovered ? 'reached' : selected ? 'selected' : 'excluded'}</text>
        </g>
      })}
    </svg>
  </section>
}
