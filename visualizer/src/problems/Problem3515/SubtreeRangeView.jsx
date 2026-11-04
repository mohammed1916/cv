import FenwickView from '../../components/shared/FenwickView'
import OperationLog from '../../components/shared/OperationLog'
import { layoutRootedTree } from '../../components/shared/treeLayout'

const GAP_X = 66
const GAP_Y = 84
const PAD = 34
const RADIUS = 17

// The tree and the flattened positions side by side: one subtree in the drawing is one unbroken run on the strip.
export default function SubtreeRangeView({ run, step }) {
  const { n } = run.input
  const layout = layoutRootedTree(run.rooted)
  const at = id => {
    const p = layout.positions.get(id)
    return { x: p.x * GAP_X + PAD, y: p.depth * GAP_Y + PAD }
  }
  const width = layout.columns * GAP_X + PAD * 2 - GAP_X + 40
  const height = (layout.rows - 1) * GAP_Y + PAD * 2 + 22
  const inRange = position => step.range && position >= step.range[0] && position <= step.range[1]
  const pathNodes = new Set(step.path)
  const pathEdge = (from, to) => pathNodes.has(from) && pathNodes.has(to)
  const known = step.order.length > 0
  return <section aria-label="Tree and subtree ranges" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Rooted weighted tree" style={{ width: '100%', maxWidth: Math.max(320, width * 1.2), maxHeight: 400 }}>
      {layout.edges.map(([from, to]) => {
        const a = at(from), b = at(to)
        const hot = pathEdge(from, to)
        const changing = step.edge === to
        const label = step.weight[to] || run.frames.at(-1).weight[to]
        const seen = step.weight[to] > 0
        return <g key={`${from}-${to}`} data-edge={`${from},${to}`}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hot ? 'var(--success)' : changing ? 'var(--warning)' : 'var(--border)'} strokeWidth={hot || changing ? 4 : 2} />
          {seen && <>
            <rect x={(a.x + b.x) / 2 - 15} y={(a.y + b.y) / 2 - 9} width={30} height={17} rx={4} fill="var(--surface)" stroke={changing ? 'var(--warning)' : 'var(--border)'} />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 4} textAnchor="middle" fontSize="11" fontWeight={hot || changing ? 700 : 400} fill="var(--text)">{label}</text>
          </>}
        </g>
      })}
      {[...layout.positions.keys()].map(id => {
        const { x, y } = at(id)
        const position = step.tin[id]
        const covered = position > 0 && inRange(position)
        const onPath = pathNodes.has(id)
        const isFocus = step.focus === id
        return <g key={id} data-node={id} data-role={isFocus ? 'focus' : onPath ? 'path' : covered ? 'covered' : ''} opacity={known && !position ? 0.45 : 1}>
          <circle cx={x} cy={y} r={RADIUS}
            fill={covered ? 'color-mix(in srgb, var(--primary) 30%, var(--surface2))' : onPath ? 'color-mix(in srgb, var(--success) 30%, var(--surface2))' : 'var(--surface2)'}
            stroke={isFocus ? 'var(--warning)' : onPath ? 'var(--success)' : covered ? 'var(--primary)' : 'var(--border)'} strokeWidth={isFocus ? 3 : 1.5} />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight={700} fill="var(--text)">{id}</text>
          {position > 0 && <text x={x} y={y + RADIUS + 13} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            {step.sized[id] ? `pos ${position}..${position + step.size[id] - 1}` : `pos ${position}`}
          </text>}
        </g>
      })}
    </svg>
    <section aria-label="Positions in visit order">
      <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>Nodes by position, with each node's current distance</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Array.from({ length: n }, (_, i) => {
          const position = i + 1
          const node = step.order[i]
          const covered = inRange(position)
          const isCut = step.cut === position
          const isFocus = node !== undefined && node === step.focus
          return <div key={position} data-position={position} data-covered={Boolean(covered)}
            style={{ minWidth: 48, padding: 4, textAlign: 'center', borderRadius: 6, background: covered ? 'color-mix(in srgb, var(--primary) 22%, var(--surface2))' : 'var(--surface2)', border: `${isFocus || isCut ? 2 : 1}px ${isCut ? 'dashed' : 'solid'} ${isFocus ? 'var(--warning)' : isCut ? 'var(--error)' : covered ? 'var(--primary)' : 'var(--border)'}` }}>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>pos {position}</small>
            <strong style={{ display: 'block' }}>{node === undefined ? '·' : `node ${node}`}</strong>
            <span data-dist={position} style={{ fontSize: '.8rem' }}>d = {step.dist[i]}</span>
          </div>
        })}
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '.8rem', color: 'var(--text-muted)' }}>
        Blue: the subtree range. Dashed red: the position that cancels the change. Green path: the edges a distance adds up.
      </p>
    </section>
    <FenwickView tree={step.tree} ops={step.ops} title="Fenwick tree over the difference of distances" />
    {step.queryIndex >= 0 && <OperationLog title="Queries" ops={step.log} current={step.queryIndex} through={step.queryIndex} />}
  </section>
}
