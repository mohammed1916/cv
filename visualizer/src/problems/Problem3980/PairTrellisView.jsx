const GAP = 86
const LEFT = 118
const ROW_Y = [96, 170]
const NODE = 19
const stateNames = ['no pair crosses', 'pair crosses']
const edgeTone = { kept: 'var(--primary)', worse: 'var(--text-muted)', blocked: 'var(--error)', best: 'var(--success)' }

const display = value => (value === null ? '' : value === Infinity ? '∞' : value)

// A layered graph: columns are boundaries between indices, rows say whether a clearing pair spans the boundary.
function Trellis({ s1, s2, step }) {
  const n = s1.length
  const width = LEFT + n * GAP + 40
  const x = boundary => LEFT + boundary * GAP
  const onBest = edge => step.pathEdges.some(p => p.i === edge.i && p.left === edge.left && p.right === edge.right)
  const isActive = edge => edge.i === step.i && edge.left === step.left && edge.right === step.right
  return <svg viewBox={`0 0 ${width} 214`} width={width} style={{ display: 'block' }} role="img" aria-label="Two-state table across the string boundaries">
    <text x={10} y={22} fontSize="12" fill="var(--text-muted)">s1</text>
    <text x={10} y={44} fontSize="12" fill="var(--text-muted)">s2</text>
    {s1.split('').map((ch, i) => {
      const cx = (x(i) + x(i + 1)) / 2
      return <g key={i} data-index={i}>
        {i === step.i && <rect x={cx - 18} y={6} width={36} height={46} rx={6} fill="color-mix(in srgb, var(--primary) 24%, var(--surface2))" stroke="var(--primary)" />}
        <text x={cx} y={22} textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--text)">{ch}</text>
        <text x={cx} y={44} textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--text)">{s2[i]}</text>
      </g>
    })}
    {ROW_Y.map((y, row) => <text key={row} x={10} y={y + 4} fontSize="11" fill="var(--text-muted)">{stateNames[row]}</text>)}
    {step.edges.map(edge => {
      const best = onBest(edge)
      const active = isActive(edge)
      const tone = best ? edgeTone.best : edgeTone[edge.status]
      const x1 = x(edge.i) + NODE
      const x2 = x(edge.i + 1) - NODE
      const y1 = ROW_Y[edge.left]
      const y2 = ROW_Y[edge.right]
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2 + (edge.left === edge.right ? -6 : edge.left === 0 ? -12 : 14)
      return <g key={`${edge.i}-${edge.left}-${edge.right}`} data-edge={`${edge.i}-${edge.left}-${edge.right}`} data-status={edge.status}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tone} strokeWidth={active || best ? 3.5 : 1.5} strokeDasharray={edge.status === 'blocked' ? '3 4' : edge.status === 'worse' && !best ? '7 5' : undefined} />
        <text x={mx} y={my} textAnchor="middle" fontSize="12" fontWeight={active || best ? 700 : 400} fill={best ? 'var(--text)' : 'var(--text-muted)'}>{edge.status === 'blocked' ? '✕' : `+${edge.cost}`}</text>
      </g>
    })}
    {step.table.flatMap((row, boundary) => row.map((value, state) => {
      const visible = value !== null
      return <g key={`${boundary}-${state}`} data-node={`${boundary}-${state}`} data-value={visible ? String(value) : ''}>
        <circle cx={x(boundary)} cy={ROW_Y[state]} r={NODE} fill="var(--surface2)" stroke={step.pathEdges.length && (boundary === 0 ? state === 0 : step.pathEdges.some(p => p.i === boundary - 1 && p.right === state)) ? edgeTone.best : 'var(--border)'} strokeWidth="2" opacity={visible ? 1 : 0.4} />
        <text x={x(boundary)} y={ROW_Y[state] + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text)">{display(value)}</text>
      </g>
    }))}
    {Array.from({ length: n + 1 }, (_, boundary) => <text key={boundary} x={x(boundary)} y={208} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{boundary === 0 ? 'start' : boundary === n ? 'end' : `before ${boundary}`}</text>)}
  </svg>
}

function PriceCard({ step }) {
  if (step.left === null || step.left === undefined) return null
  const tile = { padding: '6px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }
  const hint = { display: 'block', fontSize: 11, color: 'var(--text-muted)' }
  const { price } = step
  return <div aria-label="Price of this choice" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    <div style={tile}><span style={hint}>pair from the left</span>{step.left ? 'yes' : 'no'}</div>
    <div style={tile}><span style={hint}>start a pair here</span>{step.right ? 'yes' : 'no'}</div>
    {price ? <>
      <div style={tile}><span style={hint}>sets at this index</span>{price.sets}</div>
      <div style={tile}><span style={hint}>new pair</span>{price.pair}</div>
      <div style={tile}><span style={hint}>total</span>{price.before} + {price.cost} = {price.total}</div>
    </> : <div style={{ ...tile, borderColor: 'var(--error)' }}><span style={hint}>verdict</span>ruled out</div>}
  </div>
}

function Replay({ s2, step }) {
  const cell = changed => ({ width: 34, padding: '6px 0', textAlign: 'center', borderRadius: 6, color: 'var(--text)', fontWeight: 600, background: changed ? 'color-mix(in srgb, var(--primary) 24%, var(--surface2))' : 'var(--surface2)', border: changed ? '2px solid var(--primary)' : '1px solid var(--border)' })
  const op = step.op
  const isOp = i => op && (i === op.at || (op.kind === 'clear' && i === op.at + 1))
  return <div aria-label="Operations replayed" style={{ display: 'grid', gap: 6 }}>
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ width: 54, fontSize: 12, color: 'var(--text-muted)' }}>now</span>
      {step.current.split('').map((ch, i) => <span key={i} data-replay={i} style={cell(isOp(i))}>{ch}</span>)}
      <span style={{ marginLeft: 8, color: 'var(--text)' }}>{`operations: ${step.ops}`}</span>
    </div>
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ width: 54, fontSize: 12, color: 'var(--text-muted)' }}>target</span>
      {s2.split('').map((ch, i) => <span key={i} style={{ ...cell(false), color: step.current[i] === ch ? 'var(--text)' : 'var(--error)' }}>{ch}</span>)}
    </div>
  </div>
}

export default function PairTrellisView({ run, step }) {
  const { s1, s2 } = run.input
  return <section aria-label="Pair decisions" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <div style={{ overflowX: 'auto' }}><Trellis s1={s1} s2={s2} step={step} /></div>
    <PriceCard step={step} />
    <Replay s2={s2} step={step} />
    <output aria-label="Best total" style={{ color: 'var(--text)' }}>{step.phase === 'done' || step.phase === 'answer' || step.phase === 'replay' ? `Minimum operations: ${run.result}` : 'Solid lines are the cheapest way into a state; dashed lines lost or were ruled out.'}</output>
  </section>
}
