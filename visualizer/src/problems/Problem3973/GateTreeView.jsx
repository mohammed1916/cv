import SvgViewport from '../../components/shared/SvgViewport'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { layoutRootedTree } from '../../components/shared/treeLayout'
import { BLUE, RED, cardName } from './algorithm'

const GAP_X = 104
const GAP_Y = 92
const PAD = 40
const RADIUS = 16
const CARD = { [BLUE]: '#2563eb', [RED]: '#dc2626' }
const WARN = 'var(--warning, #d97706)'

const pathEdges = (parent, from, to) => {
  const out = []
  for (let at = from; at !== to && at !== -1; at = parent[at]) out.push(at)
  return out
}

function GatePill({ x, y, color, value, label }) {
  return <g>
    <rect x={x} y={y} width={26} height={16} rx={3} fill={color ? `color-mix(in srgb, ${color} 22%, var(--surface2))` : 'var(--surface2)'} stroke={color ?? 'var(--text)'} />
    <text x={x + 13} y={y + 12} textAnchor="middle" fontSize="10" fill="var(--text)">{label}{value}</text>
  </g>
}

function Tree({ run, step }) {
  const { parent, gates } = run.input
  const { children, depth } = run.lift
  const toNode = id => ({ id, children: children[id].map(toNode) })
  const layout = layoutRootedTree(toNode(0))
  const width = layout.columns * GAP_X + PAD
  const height = (layout.rows - 1) * GAP_Y + PAD * 2 + 24
  const at = id => {
    const p = layout.positions.get(id)
    return { x: p.x * GAP_X + PAD + 12, y: p.depth * GAP_Y + PAD }
  }
  const q = step.q
  const jumped = new Set([...(step.jump ? pathEdges(parent, step.jump.from, step.jump.to) : []), ...(step.jump2 ? pathEdges(parent, step.jump2.from, step.jump2.to) : [])])
  const onRoute = new Set(q && q.top !== undefined ? [...pathEdges(parent, q.aNode, q.top), ...pathEdges(parent, q.bNode, q.top)] : [])
  const finished = q?.bob !== undefined
  const alicePos = !q ? null : finished || step.who === 'Bob' ? q.top : step.who === 'Alice' ? step.at : q.aNode
  const bobPos = !q ? null : finished ? q.top : step.who === 'Bob' ? step.at : q.bNode
  return <SvgViewport width={width} height={height}>
    {layout.edges.map(([from, to]) => {
      const a = at(from), b = at(to)
      const hot = jumped.has(to)
      return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} data-edge={`${to}-${from}`} data-hot={hot || undefined}
        stroke={hot ? 'var(--primary)' : onRoute.has(to) ? WARN : 'var(--border)'} strokeWidth={hot ? 5 : onRoute.has(to) ? 3 : 2} />
    })}
    {parent.map((_, id) => {
      const { x, y } = at(id)
      const [red, blue, white] = gates[id]
      const isTop = q?.top === id
      const isPtr = step.ptr?.includes(id)
      const isTarget = step.jump?.to === id || step.jump2?.to === id
      const isFrom = step.jump?.from === id || step.jump2?.from === id
      return <g key={id} data-node={id} data-top={isTop || undefined}>
        <circle cx={x} cy={y} r={RADIUS} fill={isTop ? 'color-mix(in srgb, var(--success) 35%, var(--surface2))' : isPtr ? 'color-mix(in srgb, var(--primary) 26%, var(--surface2))' : 'var(--surface2)'}
          stroke={isFrom || isTarget ? 'var(--primary)' : isTop ? 'var(--success)' : 'var(--border)'} strokeWidth={isFrom || isTarget || isTop ? 3 : 2} />
        <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">{id}</text>
        {step.showDepth && <text x={x + RADIUS + 3} y={y - 8} fontSize="10" fill="var(--text-dim)">d{depth[id]}</text>}
        <GatePill x={x - 41} y={y + 20} color={CARD[RED]} label="R" value={red} />
        <GatePill x={x - 13} y={y + 20} color={CARD[BLUE]} label="B" value={blue} />
        <GatePill x={x + 15} y={y + 20} label="W" value={white} />
        {alicePos === id && <g data-token="alice"><circle cx={x - RADIUS - 8} cy={y - 8} r={10} fill="var(--surface)" stroke={CARD[q.aCard]} strokeWidth="3" /><text x={x - RADIUS - 8} y={y - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">A</text></g>}
        {bobPos === id && <g data-token="bob"><circle cx={x - RADIUS - 8} cy={y + 10} r={10} fill="var(--surface)" stroke={CARD[q.bCard]} strokeWidth="3" /><text x={x - RADIUS - 8} y={y + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">B</text></g>}
      </g>
    })}
  </SvgViewport>
}

function Matrix({ m }) {
  const rowTint = [CARD[BLUE], CARD[RED]]
  return <span style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: 11, verticalAlign: 'middle' }}>
    {[0, 1].flatMap(i => [0, 1].map(j => <span key={`${i}${j}`} style={{ minWidth: 22, padding: '0 3px', textAlign: 'center', color: 'var(--text)', background: `color-mix(in srgb, ${rowTint[i]} 14%, var(--surface))` }}>{m[i][j]}</span>))}
  </span>
}

function LiftTable({ run, step }) {
  const { levels, up, table, order } = run.lift
  const n = run.input.parent.length
  const built = new Set(order.slice(0, step.builtCount).map(c => `${c.level}:${c.node}`))
  const isCell = (c, j, v) => c && c.level === j && c.node === v
  const pad = { padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'center' }
  return <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse' }} aria-label="Jump table">
      <caption style={{ textAlign: 'left', fontWeight: 700, marginBottom: 4 }}>Jump table: ancestor and matrix (rows are the card before, blue then red; columns the card after)</caption>
      <thead><tr><th style={pad} scope="col">node</th>{Array.from({ length: levels }, (_, j) => <th key={j} style={pad} scope="col">{2 ** j} step{j ? 's' : ''}</th>)}</tr></thead>
      <tbody>{Array.from({ length: n }, (_, v) => <tr key={v}>
        <th style={pad} scope="row">{v}</th>
        {Array.from({ length: levels }, (_, j) => {
          const current = isCell(step.cell, j, v)
          const source = step.sources?.some(c => isCell(c, j, v))
          const filled = built.has(`${j}:${v}`)
          return <td key={j} data-cell={`${j}:${v}`} data-state={current ? 'current' : source ? 'source' : filled ? 'filled' : 'empty'}
            style={{ ...pad, background: current ? 'color-mix(in srgb, var(--primary) 26%, transparent)' : source ? 'color-mix(in srgb, var(--success) 22%, transparent)' : undefined, outline: current ? '2px solid var(--primary)' : 'none', outlineOffset: -2 }}>
            {filled ? <><span style={{ fontSize: 11 }}>to {up[j][v]} </span><Matrix m={table[j][v]} /></> : <span style={{ color: 'var(--text-dim)' }}>·</span>}
          </td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

function Ways({ label, ways }) {
  return <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, fontSize: 13 }}>
    <small style={{ color: 'var(--text-dim)' }}>{label}</small>
    {[BLUE, RED].map(card => <span key={card} style={{ padding: '1px 8px', borderRadius: 4, border: `2px solid ${CARD[card]}`, color: 'var(--text)', background: 'var(--surface2)' }}>{cardName(card)}: {ways[card]}</span>)}
  </span>
}

// The tree with gates and travellers, the doubling table, the way counts for the current climb, and query results.
export default function GateTreeView({ run, step }) {
  return <section aria-label="Gate paths on the tree" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <Tree run={run} step={step} />
    {step.who && <div aria-label="Way counts" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <strong>{step.who} from {step.start}, {step.steps} step{step.steps === 1 ? '' : 's'}</strong>
      {step.before && <><Ways label="before" ways={step.before} /><span>×</span><Matrix m={step.matrix} /><span>=</span></>}
      <Ways label="now" ways={step.ways} />
      {step.total !== undefined && <strong>total {step.total}</strong>}
    </div>}
    <LiftTable run={run} step={step} />
    <RecordStateTable label={`Query results, answer so far ${step.answer}`}
      columns={['query', 'Alice', 'Bob', 'LCA', 'Alice ways', 'Bob ways', 'product', 'XOR so far']} rows={step.rows}
      activeRow={step.phase === 'combine' ? step.rows.length - 1 : -1} />
  </section>
}
