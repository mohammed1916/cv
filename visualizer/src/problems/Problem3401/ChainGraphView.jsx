import RecordStateTable from '../../components/shared/RecordStateTable'

const W_GAP = 26, NODE_R = 17

// Groups the arrows into separate loops and open lines, each drawn around its own circle.
function layoutChains(rows) {
  const next = new Map(rows.map(r => [r.giver_id, r]))
  const receivers = new Set(rows.map(r => r.receiver_id))
  const seen = new Set()
  const parts = []
  const walk = from => {
    const nodes = [from]
    seen.add(from)
    let at = from
    while (next.has(at)) {
      const to = next.get(at).receiver_id
      if (seen.has(to)) break
      seen.add(to)
      nodes.push(to)
      at = to
    }
    return nodes
  }
  for (const r of rows) if (!receivers.has(r.giver_id) && !seen.has(r.giver_id)) parts.push(walk(r.giver_id))
  for (const r of rows) if (!seen.has(r.giver_id)) parts.push(walk(r.giver_id))
  let x = W_GAP
  const pos = new Map()
  let height = 0
  for (const nodes of parts) {
    const radius = Math.max(46, nodes.length * 15)
    const cx = x + radius + NODE_R
    const cy = radius + NODE_R + 20
    nodes.forEach((id, i) => {
      const a = 2 * Math.PI * i / nodes.length - Math.PI / 2
      pos.set(id, { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) })
    })
    x = cx + radius + NODE_R + W_GAP
    height = Math.max(height, cy + radius + NODE_R + 20)
  }
  return { pos, width: Math.max(x, 240), height: Math.max(height, 120) }
}

const MARKERS = { idle: 'var(--text-dim)', active: 'var(--primary)', closed: 'var(--success)', open: 'var(--error)' }

function GiftEdge({ from, to, value, kind, id }) {
  const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  // Bend each arrow to its own right so that a two-person swap draws as two separate curves.
  const bend = 20
  const mx = (from.x + to.x) / 2 - uy * bend, my = (from.y + to.y) / 2 + ux * bend
  const start = { x: from.x + ux * NODE_R, y: from.y + uy * NODE_R }
  const end = { x: to.x - ux * (NODE_R + 5), y: to.y - uy * (NODE_R + 5) }
  return <g data-edge={id} data-kind={kind}>
    <path d={`M ${start.x} ${start.y} Q ${mx} ${my} ${end.x} ${end.y}`} fill="none" style={{ stroke: MARKERS[kind] }} strokeWidth={kind === 'idle' ? 1.5 : 3} markerEnd={`url(#p3401-${kind})`} />
    <text x={mx} y={my + 4} textAnchor="middle" fontSize="11" style={{ fill: 'var(--text)', fontWeight: kind === 'idle' ? 400 : 700, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 3 }}>{value}</text>
  </g>
}

export default function ChainGraphView({ run, step }) {
  const rows = run.input.SecretSanta
  const { pos, width, height } = layoutChains(rows)
  const walker = step.walker >= 0 ? step.walks[step.walker] : null
  const trail = new Set(step.trail)
  const closed = new Set(step.closedEdges)
  const open = new Set(step.openEdges)
  const walkRows = step.walks.map(w => ({ start: w.start, at: w.at, hops: w.hops, total: w.total, path: w.path.join(' → '), status: w.status }))
  const kindOf = id => trail.has(id) ? 'active' : closed.has(id) ? 'closed' : open.has(id) ? 'open' : 'idle'
  return <section aria-label="Gift exchange chains" style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text)' }}>
    {rows.length > 0 && <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Directed graph of gifts" style={{ display: 'block' }}>
        <defs>{Object.entries(MARKERS).map(([kind, color]) => <marker key={kind} id={`p3401-${kind}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" style={{ fill: color }} /></marker>)}</defs>
        {rows.map(r => <GiftEdge key={`${r.giver_id}>${r.receiver_id}`} id={`${r.giver_id}>${r.receiver_id}`} from={pos.get(r.giver_id)} to={pos.get(r.receiver_id)} value={r.gift_value} kind={kindOf(`${r.giver_id}>${r.receiver_id}`)} />)}
        {[...pos.entries()].map(([id, p]) => {
          const isStart = walker?.start === id, isAt = walker?.at === id
          return <g key={id} data-node={id} data-role={isAt ? 'at' : isStart ? 'start' : ''}>
            <circle cx={p.x} cy={p.y} r={NODE_R} style={{ fill: isAt ? 'var(--surface3)' : 'var(--surface2)', stroke: isAt ? 'var(--primary)' : isStart ? 'var(--success)' : 'var(--border)', strokeWidth: isAt || isStart ? 3 : 1.5 }} />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" style={{ fill: 'var(--text)', fontWeight: 600 }}>{id}</text>
            {isStart && <text x={p.x} y={p.y - NODE_R - 4} textAnchor="middle" fontSize="10" style={{ fill: 'var(--text)' }}>start</text>}
            {isAt && !isStart && <text x={p.x} y={p.y - NODE_R - 4} textAnchor="middle" fontSize="10" style={{ fill: 'var(--text)' }}>at</text>}
          </g>
        })}
      </svg>
    </div>}
    <p style={{ margin: 0, fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ borderBottom: `3px solid ${MARKERS.active}` }}>current walk</span>
      <span style={{ borderBottom: `3px solid ${MARKERS.closed}` }}>on a closed loop</span>
      <span style={{ borderBottom: `3px solid ${MARKERS.open}` }}>on an open line</span>
      <span style={{ borderBottom: `2px solid ${MARKERS.idle}` }}>not walked yet</span>
    </p>
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <RecordStateTable label="SecretSanta" columns={['giver_id', 'receiver_id', 'gift_value']} rows={rows} activeRow={step.rowIndex} />
      </div>
      <div style={{ flex: '2 1 340px', minWidth: 0 }}>
        <RecordStateTable label="Latest row of each walk" columns={['start', 'at', 'hops', 'total', 'path', 'status']} rows={walkRows} activeRow={step.walker} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}><RecordStateTable label="Closed walks" columns={['start', 'hops', 'total']} rows={step.closedRows} activeRow={step.closedIndex} /></div>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}><RecordStateTable label="Distinct combinations" columns={['chain_length', 'total_gift_value']} rows={step.distinct} /></div>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}><RecordStateTable label="Result" columns={['chain_id', 'chain_length', 'total_gift_value']} rows={step.chains} /></div>
    </div>
  </section>
}
