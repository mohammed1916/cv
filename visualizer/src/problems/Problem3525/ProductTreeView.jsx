const SLOT = 72
const ROW = 76
const NODE_H = 56
const BOX = 12

const cell = { border: '1px solid var(--border)', borderRadius: 6, padding: '4px 6px', textAlign: 'center', background: 'var(--surface2)', color: 'var(--text)' }

// nums with residues, the removed prefix, and each allowed end's product as the tree reveals it.
function ArrayStrip({ step, k }) {
  const { nums, query } = step
  const start = query ? query[2] : 0
  const x = query ? query[3] : null
  const endAt = Object.fromEntries(step.ends.map(entry => [entry.end, entry.remainder]))
  return <section aria-label="Array and products from start">
    <strong>Array</strong>
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
      {nums.map((value, index) => {
        const removed = query && index < start
        const hit = endAt[index] !== undefined && endAt[index] === x
        const changed = step.changed === index
        return <div key={index} data-index={index} data-removed={removed ? 'true' : undefined} data-hit={hit ? 'true' : undefined}
          style={{ ...cell, minWidth: 62, opacity: removed ? 0.42 : 1, borderColor: hit ? 'var(--success)' : changed ? 'var(--primary)' : 'var(--border)', borderWidth: hit || changed ? 2 : 1 }}>
          <small style={{ color: 'var(--primary)', display: 'block', minHeight: 15, fontWeight: 700 }}>{query && index === start ? 'start' : ' '}</small>
          <small style={{ color: 'var(--text-muted)' }}>[{index}]</small>
          <strong style={{ display: 'block', overflowWrap: 'anywhere' }}>{value}</strong>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>mod {k} = {value % k}</small>
          <small style={{ display: 'block', minHeight: 15, fontWeight: 600 }}>
            {removed ? 'removed' : endAt[index] !== undefined ? `product ${endAt[index]}${hit ? ' ✓' : ''}` : ' '}
          </small>
        </div>
      })}
    </div>
    {query && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>A ✓ marks an end position whose product from index {start} leaves remainder {x}.</p>}
  </section>
}

function nodeRole(step, id) {
  if (step.node === id) return 'current'
  if (step.covered.includes(id)) return 'covered'
  if (step.children.includes(id)) return 'child'
  if (step.path.includes(id)) return 'path'
  if (step.skipped.includes(id)) return 'skipped'
  return ''
}

const ROLE_STROKE = { current: 'var(--primary)', covered: 'var(--success)', child: 'var(--warning)', path: 'var(--primary)', skipped: 'var(--border)', '': 'var(--text-dim)' }

function Tree({ step, k, n }) {
  const nodes = step.tree
  if (!nodes.length) return null
  const center = (lo, hi) => ((lo + hi + 1) / 2) * SLOT
  const depthOf = id => Math.floor(Math.log2(id))
  const maxDepth = Math.max(...nodes.map(node => depthOf(node.id)))
  const width = n * SLOT
  const height = (maxDepth + 1) * ROW
  const byId = Object.fromEntries(nodes.map(node => [node.id, node]))
  const y = id => depthOf(id) * ROW + 2
  return <section aria-label="Segment tree of prefix remainder counts">
    <strong>Segment tree</strong>
    <p style={{ margin: '2px 0 4px', fontSize: 12, color: 'var(--text-muted)' }}>Each node shows its range, its product p mod {k}, and a count box for each remainder 0 to {k - 1}.</p>
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Segment tree with ${nodes.length} nodes`} style={{ display: 'block' }}>
        {nodes.filter(node => node.id > 1 && byId[node.id >> 1]).map(node => {
          const parent = byId[node.id >> 1]
          return <line key={`edge-${node.id}`} x1={center(parent.lo, parent.hi)} y1={y(parent.id) + NODE_H} x2={center(node.lo, node.hi)} y2={y(node.id)} stroke="var(--border)" strokeWidth="1.5" />
        })}
        {nodes.map(node => {
          const role = nodeRole(step, node.id)
          const nodeWidth = SLOT - 6
          const cx = center(node.lo, node.hi)
          const left = cx - nodeWidth / 2
          const boxesLeft = cx - (k * BOX) / 2
          const dim = role === 'skipped'
          return <g key={node.id} data-node={node.id} data-role={role || undefined} opacity={dim ? 0.42 : 1}>
            <title>{`Range ${node.lo} to ${node.hi}, product ${node.prod}, counts ${node.cnt.join(', ')}`}</title>
            <rect x={left} y={y(node.id)} width={nodeWidth} height={NODE_H} rx="7" fill={role === 'current' ? 'color-mix(in srgb, var(--primary) 20%, var(--surface2))' : role === 'covered' ? 'color-mix(in srgb, var(--success) 16%, var(--surface2))' : 'var(--surface2)'} stroke={ROLE_STROKE[role]} strokeWidth={role ? 2.4 : 1} />
            <text x={cx} y={y(node.id) + 14} textAnchor="middle" fontSize="11" fill="var(--text-muted)">{node.lo === node.hi ? `[${node.lo}]` : `[${node.lo}, ${node.hi}]`}</text>
            <text x={cx} y={y(node.id) + 28} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">p = {node.prod}</text>
            {node.cnt.map((value, r) => <g key={r}>
              <rect x={boxesLeft + r * BOX} y={y(node.id) + 34} width={BOX} height={16} fill={value ? 'color-mix(in srgb, var(--primary) 26%, var(--surface))' : 'var(--surface)'} stroke="var(--border)" />
              <text x={boxesLeft + r * BOX + BOX / 2} y={y(node.id) + 46} textAnchor="middle" fontSize="10" fill="var(--text)">{value}</text>
            </g>)}
          </g>
        })}
      </svg>
    </div>
  </section>
}

// Draws what multiplying by p does: remainder r lands on p × r mod k, and the counts travel with it.
function ShiftTable({ shift, k }) {
  if (!shift) return null
  const { multiplier, base, incoming, targets, result, baseLabel, incomingLabel } = shift
  const heads = Array.from({ length: k }, (_, r) => r)
  const th = { ...cell, fontWeight: 600, background: 'transparent', border: 0 }
  return <section aria-label="Remainder shift" data-shift={shift.kind}>
    <strong>Shift by {multiplier}: remainder r moves to {multiplier} × r mod {k}</strong>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 3, marginTop: 4 }}>
        <thead><tr><th scope="col" style={th}>remainder r</th>{heads.map(r => <th scope="col" key={r} style={th}>{r}</th>)}</tr></thead>
        <tbody>
          <tr><th scope="row" style={th}>{incomingLabel}</th>{incoming.map((value, r) => <td key={r} style={cell}>{value}</td>)}</tr>
          <tr><th scope="row" style={th}>lands on</th>{targets.map((target, r) => <td key={r} style={{ ...cell, fontWeight: incoming[r] ? 700 : 400, borderColor: incoming[r] ? 'var(--primary)' : 'var(--border)' }}>{incoming[r] ? `→ ${target}` : '·'}</td>)}</tr>
          <tr><th scope="row" style={th}>{baseLabel}</th>{base.map((value, r) => <td key={r} style={cell}>{value}</td>)}</tr>
          <tr><th scope="row" style={th}>result</th>{result.map((value, r) => <td key={r} style={{ ...cell, fontWeight: 700, borderColor: value !== base[r] ? 'var(--success)' : 'var(--border)', borderWidth: value !== base[r] ? 2 : 1 }}>{value}</td>)}</tr>
        </tbody>
      </table>
    </div>
  </section>
}

function QueryState({ step }) {
  const { query, total, carry } = step
  return <section aria-label="Query state" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'baseline' }}>
    <span><strong>Query:</strong> {query ? `#${step.queryIndex}: nums[${query[0]}] = ${query[1]}, start ${query[2]}, x ${query[3]}` : 'none active'}</span>
    {carry !== null && <span><strong>Carry product:</strong> {carry}</span>}
    {total && <span><strong>Total counts:</strong> {total.map((value, r) => <span key={r} data-total={r} style={{ ...cell, display: 'inline-block', margin: '0 2px', padding: '0 6px', fontWeight: query && query[3] === r ? 700 : 400, borderColor: query && query[3] === r ? 'var(--success)' : 'var(--border)' }}>{r}: {value}</span>)}</span>}
    <span><strong>Answers:</strong> [{step.answers.join(', ')}]</span>
  </section>
}

export default function ProductTreeView({ run, step }) {
  const { k } = run.input
  return <section aria-label="Remainder counting state" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <QueryState step={step} />
    <ArrayStrip step={step} k={k} />
    <ShiftTable shift={step.shift} k={k} />
    <Tree step={step} k={k} n={run.input.nums.length} />
  </section>
}
