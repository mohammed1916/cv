import RecordStateTable from '../../components/shared/RecordStateTable'

// The graph is drawn on a circle with directed edges and their weights. The table shows the three distance arrays
// and the total for each candidate meeting node; the node being tried is outlined.
export default function PathMeetView({ run, step }) {
  const { n, edges, src1, src2, dest } = run.input
  const R = 110
  const cx = 150
  const cy = 130
  const pos = Array.from({ length: n }, (_, i) => ({ x: cx + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: cy + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) }))
  const rows = Array.from({ length: n }, (_, v) => ({
    node: v,
    'from src1': step.d1?.[v] ?? '-',
    'from src2': step.d2?.[v] ?? '-',
    'to dest': step.d3?.[v] ?? '-',
    total: step.d1 && step.d2 && step.d3 && step.d1[v] !== null && step.d2[v] !== null && step.d3[v] !== null ? step.d1[v] + step.d2[v] + step.d3[v] : '-',
  }))
  const role = v => (v === src1 ? 'src1' : v === src2 ? 'src2' : v === dest ? 'dest' : '')
  return (
    <div className="path-meet-view">
      <svg viewBox="0 0 300 260" role="img" aria-label="Directed weighted graph" className="path-meet-graph">
        <defs><marker id="arrow2203" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)" /></marker></defs>
        {edges.map(([u, v, w], i) => <g key={i}>
          <line x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke="var(--text-muted)" markerEnd="url(#arrow2203)" />
          <text x={(pos[u].x + pos[v].x) / 2} y={(pos[u].y + pos[v].y) / 2 - 4} fontSize="11" fill="var(--text)">{w}</text>
        </g>)}
        {pos.map((p, v) => <g key={v}>
          <circle cx={p.x} cy={p.y} r="16" fill="var(--surface2)" stroke={step.meet === v || step.index === v ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={step.index === v ? 3 : 1} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fill="var(--text)">{v}</text>
          {role(v) && <text x={p.x} y={p.y + 30} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{role(v)}</text>}
        </g>)}
      </svg>
      <RecordStateTable label="Distances and meeting totals" columns={['node', 'from src1', 'from src2', 'to dest', 'total']} rows={rows} activeRow={step.index} />
      <p>{step.message}</p>
    </div>
  )
}
