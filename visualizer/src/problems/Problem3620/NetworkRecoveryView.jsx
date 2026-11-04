import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'

const COL = 112
const ROW = 74
const PAD = 34
const R = 18

// Column = longest hop distance from any source, so every edge visibly runs left to right.
function layout(n, edges) {
  const depth = Array(n).fill(0)
  for (let pass = 0; pass < n; pass++) {
    for (const [u, v] of edges) depth[v] = Math.max(depth[v], depth[u] + 1)
  }
  const columns = new Map()
  depth.forEach((d, node) => columns.set(d, [...(columns.get(d) ?? []), node]))
  const tallest = Math.max(...[...columns.values()].map(list => list.length))
  const points = Array(n)
  for (const [d, list] of columns) {
    list.forEach((node, i) => {
      points[node] = { x: PAD + d * COL, y: PAD + (tallest - list.length) * ROW / 2 + i * ROW }
    })
  }
  return { points, depth, width: PAD * 2 + Math.max(...depth) * COL, height: PAD * 2 + (tallest - 1) * ROW + 14 }
}

const EDGE_STYLE = {
  offline: { stroke: 'var(--text-dim)', strokeWidth: 1.2, strokeDasharray: '2 5', opacity: 0.55 },
  below: { stroke: 'var(--warning)', strokeWidth: 1.4, strokeDasharray: '6 5', opacity: 0.7 },
  open: { stroke: 'var(--text-muted)', strokeWidth: 1.8 },
  active: { stroke: 'var(--primary)', strokeWidth: 3.4 },
  path: { stroke: 'var(--success)', strokeWidth: 3.4 },
}

function Graph({ run, step }) {
  const { edges, online } = run.input
  const n = online.length
  const { points, depth, width, height } = layout(n, edges)
  return <figure style={{ margin: 0 }}>
    <figcaption style={{ fontWeight: 600, marginBottom: 4 }}>Network{step.floor !== null ? `: only edges costing ${step.floor} or more are allowed` : ''}</figcaption>
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Directed network with node costs" style={{ display: 'block' }}>
        <defs>
          {Object.entries(EDGE_STYLE).map(([role, style]) => <marker key={role} id={`p3620-arrow-${role}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0L10 5L0 10z" fill={style.stroke} />
          </marker>)}
        </defs>
        {edges.map(([u, v, cost], index) => {
          const a = points[u]
          const b = points[v]
          const role = step.roles[index]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const length = Math.hypot(dx, dy) || 1
          // Edges that jump columns bow outward so they do not run through the nodes between.
          const bend = (depth[v] - depth[u] > 1 || dx === 0 ? 34 : 8) * (index % 2 ? 1 : -1)
          const cx = (a.x + b.x) / 2 - (dy / length) * bend
          const cy = (a.y + b.y) / 2 + (dx / length) * bend
          const toEnd = Math.hypot(b.x - cx, b.y - cy) || 1
          const endX = b.x - ((b.x - cx) / toEnd) * (R + 3)
          const endY = b.y - ((b.y - cy) / toEnd) * (R + 3)
          const labelX = (a.x + 2 * cx + b.x) / 4
          const labelY = (a.y + 2 * cy + b.y) / 4
          return <g key={index} data-edge={index} data-role={role}>
            <path d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${endX} ${endY}`} fill="none" {...EDGE_STYLE[role]} markerEnd={`url(#p3620-arrow-${role})`} />
            <rect x={labelX - 11} y={labelY - 9} width={22} height={16} rx={4} fill="var(--surface)" opacity={0.92} />
            <text x={labelX} y={labelY + 3} textAnchor="middle" fontSize="11" fill={role === 'below' || role === 'offline' ? 'var(--text-dim)' : 'var(--text)'} fontWeight={role === 'active' || role === 'path' ? 700 : 400}>{cost}</text>
          </g>
        })}
        {online.map((isOnline, node) => {
          const { x, y } = points[node]
          const isCurrent = step.node === node
          const value = step.dist[node]
          return <g key={node} data-node={node}>
            <circle cx={x} cy={y} r={R} fill={isCurrent ? 'color-mix(in srgb, var(--primary) 26%, var(--surface2))' : 'var(--surface2)'}
              stroke={isCurrent ? 'var(--primary)' : isOnline ? 'var(--text-muted)' : 'var(--text-dim)'} strokeWidth={isCurrent ? 3 : 1.5} strokeDasharray={isOnline ? undefined : '3 3'} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={isOnline ? 'var(--text)' : 'var(--text-dim)'}>{node}</text>
            <text x={x} y={y + R + 13} textAnchor="middle" fontSize="11" fill={isOnline ? 'var(--text-muted)' : 'var(--text-dim)'}>
              {!isOnline ? 'offline' : step.floor === null ? (node === 0 ? 'start' : node === n - 1 ? 'target' : '') : value === Infinity ? 'cost ∞' : `cost ${value}`}
            </text>
          </g>
        })}
      </svg>
    </div>
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', listStyle: 'none', padding: 0, margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
      <li><Swatch role="open" /> allowed</li>
      <li><Swatch role="below" /> below the floor</li>
      <li><Swatch role="offline" /> touches offline node</li>
      <li><Swatch role="active" /> being relaxed</li>
      <li><Swatch role="path" /> cheapest route</li>
    </ul>
  </figure>
}

function Swatch({ role }) {
  const { stroke, strokeWidth, strokeDasharray } = EDGE_STYLE[role]
  return <svg width="22" height="8" aria-hidden="true" style={{ verticalAlign: 'middle' }}><line x1="0" y1="4" x2="22" y2="4" stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} /></svg>
}

function BudgetGauge({ cost, k }) {
  if (cost === null) return null
  const reachable = cost !== Infinity
  const over = !reachable || cost > k
  const scale = Math.max(k, reachable ? cost : k, 1)
  return <section aria-label="Cheapest route against the budget" style={{ margin: '8px 0' }}>
    <strong>Cheapest route against the budget</strong>
    <div style={{ position: 'relative', height: 16, margin: '4px 0', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {reachable && <div style={{ height: '100%', width: `${(cost / scale) * 100}%`, background: over ? 'var(--warning)' : 'var(--success)', opacity: 0.75 }} />}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${(k / scale) * 100}% - 1px)`, width: 2, background: 'var(--text)' }} />
    </div>
    <small style={{ color: 'var(--text-muted)' }}>{reachable ? `cost ${cost}` : 'target unreachable'} · budget line at {k}</small>
  </section>
}

export default function NetworkRecoveryView({ run, step }) {
  const { online, k } = run.input
  const shownOrder = step.order
  const costRows = shownOrder.map((node, position) => ({
    position,
    node,
    state: !online[node] ? 'offline' : position < step.visited || (position === step.visited && step.node !== node) ? 'done' : position === step.visited ? 'current' : 'waiting',
    cost: step.floor === null ? '—' : step.dist[node] === Infinity ? '∞' : step.dist[node],
    arrivedBy: step.via[node] === -1 ? '—' : `edge from ${run.input.edges[step.via[node]][0]}`,
  }))
  const ladderRole = index => {
    const marks = []
    if (index === step.lo) marks.push('lo')
    if (index === step.hi) marks.push('hi')
    if (step.ladder[index] !== 'untested') marks.push(step.ladder[index])
    return marks.join(' ')
  }
  return <section aria-label="Network recovery state" style={{ display: 'grid', gap: 10, color: 'var(--text)' }}>
    <Graph run={run} step={step} />
    <output aria-label="Current offer" style={{ minHeight: 22, fontWeight: 600 }}>
      {step.offer ? `Node ${step.offer.from} offers node ${step.offer.to} a cost of ${step.offer.value}: ${step.offer.improved ? 'accepted' : 'rejected'}` : `Best floor so far: ${step.best === -1 ? 'none' : step.best} · budget k = ${k}`}
    </output>
    {step.costs.length > 0 && <IndexedSequence label="Candidate floors (binary search)" length={step.costs.length}
      valueAt={index => step.costs[index]} active={step.mid} roleAt={ladderRole} />}
    <BudgetGauge cost={step.sinkCost} k={k} />
    {costRows.length > 0 && <RecordStateTable label="Nodes in topological order" columns={['position', 'node', 'state', 'cost', 'arrivedBy']} rows={costRows}
      activeRow={step.node === -1 ? -1 : shownOrder.indexOf(step.node)} />}
    {step.probes.length > 0 && <RecordStateTable label="Floors tried" columns={['floor', 'cheapest', 'budget', 'verdict']} rows={step.probes} activeRow={step.probes.length - 1} />}
  </section>
}
