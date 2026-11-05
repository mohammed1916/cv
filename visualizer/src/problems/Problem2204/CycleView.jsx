// Nodes sit on a circle. Peeled leaves are dimmed, cycle nodes are outlined, and each node shows its distance found so far.
export default function CycleView({ run, step }) {
  const { n, edges } = run.input
  const R = 110
  const cx = 150
  const cy = 130
  const pos = Array.from({ length: n }, (_, i) => ({ x: cx + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: cy + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) }))
  const removed = step.removed ?? Array(n).fill(false)
  const cycleReady = step.phase === 'cycle' || step.phase === 'bfs' || step.phase === 'done'
  return (
    <div className="cycle-view">
      <svg viewBox="0 0 300 260" role="img" aria-label="Undirected graph with one cycle" className="cycle-graph">
        {edges.map(([u, v], i) => <line key={i} x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke="var(--text-muted)" strokeWidth={cycleReady && !removed[u] && !removed[v] ? 3 : 1} opacity={removed[u] || removed[v] ? 0.35 : 1} />)}
        {pos.map((p, v) => {
          const onCycle = cycleReady && !removed[v]
          const dist = step.dist?.[v] ?? -1
          return <g key={v} opacity={removed[v] ? 0.35 : 1}>
            <circle cx={p.x} cy={p.y} r="16" fill="var(--surface2)" stroke={onCycle ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={step.index === v ? 3 : onCycle ? 2 : 1} />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fill="var(--text)">{v}</text>
            <text x={p.x} y={p.y + 30} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{dist >= 0 ? `dist ${dist}` : removed[v] ? 'peeled' : ''}</text>
          </g>
        })}
      </svg>
      <p>{step.message}</p>
    </div>
  )
}
