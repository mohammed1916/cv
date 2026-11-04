import { layoutRootedTree } from '../../components/shared/treeLayout'

const GAP_X = 62, GAP_Y = 68, PAD = 30, R = 19
const tint = token => `color-mix(in srgb, var(${token}) 26%, var(--surface))`
const box = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, overflowX: 'auto', color: 'var(--text)' }
const heading = { margin: '0 0 8px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }
const th = { padding: '3px 8px', background: 'var(--surface3)', color: 'var(--text)', textAlign: 'center', whiteSpace: 'nowrap' }
const td = { padding: '3px 8px', borderTop: '1px solid var(--border)', color: 'var(--text)', textAlign: 'center', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }
const dot = value => (value === null || value === undefined ? '·' : value)

function Tree({ run, step }) {
  const { nums } = run.input
  const layout = layoutRootedTree(run.tree)
  const at = id => { const p = layout.positions.get(id); return { x: p.x * GAP_X + PAD, y: p.depth * GAP_Y + PAD } }
  const width = layout.columns * GAP_X + PAD * 2 - GAP_X + 30
  const height = (layout.rows - 1) * GAP_Y + PAD * 2 + 22
  const subtree = new Set(step.subtree)
  const blocked = new Set(step.blocked)
  const solved = new Set(step.solved)
  const invertedSet = new Set(step.inverted ?? [])
  const fillFor = id => {
    if (step.finalValues) {
      if (invertedSet.has(id)) return tint('--error')
      return step.finalValues[id] === nums[id] ? 'var(--surface)' : tint('--warning')
    }
    if (id === step.v) return tint('--primary')
    if (id === step.child) return tint('--info')
    if (blocked.has(id)) return tint('--error')
    if (solved.has(id)) return 'var(--surface3)'
    return 'var(--surface)'
  }
  const strokeFor = id => {
    if (invertedSet.has(id)) return 'var(--error)'
    if (id === step.v && !step.finalValues) return 'var(--primary)'
    if (id === step.child) return 'var(--info)'
    if (blocked.has(id)) return 'var(--error)'
    return subtree.has(id) && !step.finalValues ? 'var(--text-muted)' : 'var(--border)'
  }
  const entries = [...layout.positions.keys()]
  return <div style={box}>
    <h3 style={heading}>{step.finalValues ? 'Chosen inversions: final value under each node' : 'Tree: node id inside, value below'}</h3>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Rooted tree" style={{ display: 'block', maxWidth: '100%' }}>
      {layout.edges.map(([from, to]) => {
        const a = at(from), b = at(to)
        const lit = subtree.has(from) && subtree.has(to) && !step.finalValues
        return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lit ? 'var(--text-muted)' : 'var(--border)'} strokeWidth={lit ? 2 : 1} />
      })}
      {entries.map(id => {
        const { x, y } = at(id)
        const value = step.finalValues ? step.finalValues[id] : nums[id]
        return <g key={id} data-node={id} data-inverted={invertedSet.has(id) || undefined} data-blocked={blocked.has(id) || undefined}>
          <circle cx={x} cy={y} r={R} fill={fillFor(id)} stroke={strokeFor(id)} strokeWidth={invertedSet.has(id) || id === step.v || id === step.child ? 3 : 1.5} strokeDasharray={blocked.has(id) ? '4 3' : undefined} />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">{id}</text>
          <text x={x} y={y + R + 15} textAnchor="middle" fontSize="12" fill="var(--text)">{value}</text>
        </g>
      })}
    </svg>
    <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
      {step.finalValues ? 'Red: inverted here. Tinted: value changed sign.' : 'Purple: current node. Blue: child being merged. Dashed red: too close to an inverted current node. Grey fill: already solved.'}
    </p>
  </div>
}

function Row({ label, row, active, target, tone }) {
  return <tr data-row={label}>
    <th scope="row" style={{ ...th, textAlign: 'left', fontWeight: active ? 700 : 400 }}>{label}</th>
    {(row ?? []).map((value, d) => <td key={d} data-distance={d} style={{ ...td, fontWeight: d === target ? 700 : 400, background: d === target ? tint(tone ?? '--primary') : undefined }}>{dot(value)}</td>)}
    {!row && <td colSpan={99} style={{ ...td, color: 'var(--text-dim)' }}>not filled yet</td>}
  </tr>
}

function Header({ K }) {
  return <thead><tr>
    <th scope="col" style={th} />
    {Array.from({ length: K + 1 }, (_, d) => <th key={d} scope="col" style={th}>{d === K ? `≥ ${K}` : d}</th>)}
  </tr></thead>
}

// Pairs of nearest distances: each cell adds both totals, or shows why the pair cannot be used.
function MergeMatrix({ step, K }) {
  return <div style={box}>
    <h3 style={heading}>Merging child {step.child}: rows are nearest distance so far, columns are the child's. An ✕ pair is too close (sum below {K}).</h3>
    <table style={{ borderCollapse: 'collapse' }}>
      <Header K={K} />
      <tbody>{step.matrix.map((cells, d1) => <tr key={d1}>
        <th scope="row" style={th}>{d1 === K ? `≥ ${K}` : d1}</th>
        {cells.map((cell, d2) => {
          const chosen = cell.kind === 'ok' && step.keep[Math.min(d1, d2)] === cell.value
          return <td key={d2} data-pair={`${d1},${d2}`} data-kind={cell.kind} data-chosen={chosen || undefined} style={{ ...td, fontWeight: chosen ? 700 : 400, color: cell.kind === 'close' ? 'var(--error)' : cell.kind === 'none' ? 'var(--text-dim)' : 'var(--text)', background: chosen ? tint('--success') : undefined }}>{cell.kind === 'ok' ? cell.value : cell.kind === 'close' ? '✕' : '·'}</td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

// The tree beside the DP table of the current node; merge frames add the distance pair grid.
export default function CooldownTreeView({ run, step }) {
  const K = run.K
  const merging = step.phase === 'merge'
  const flipsLabel = flips => (flips ? 'odd inversions above' : 'even inversions above')
  const target = step.phase === 'invert' ? 0 : step.phase === 'own' ? K : null
  const showTable = step.v >= 0 && step.table
  return <section aria-label="Tree and distance table" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Tree run={run} step={step} />
    {showTable && <div style={box}>
      <h3 style={heading}>Best subtree total at node {step.v}, by distance to the nearest inverted node inside it. Distance 0 means the node itself is inverted. · means impossible.</h3>
      <table style={{ borderCollapse: 'collapse' }}>
        <Header K={K} />
        <tbody>
          {[0, 1].map(flips => {
            const filling = !step.finalValues && flips === step.flips && step.keep && !step.table[flips]
            return <Row key={flips} label={flipsLabel(flips)} active={flips === step.flips} row={filling ? step.keep : step.table[flips]} target={filling ? target : null} />
          })}
          {merging && <Row label={`before child ${step.child}`} row={step.before} />}
          {merging && <Row label={`child ${step.child}, one edge up`} row={step.childRow} tone="--info" />}
        </tbody>
      </table>
    </div>}
    {merging && <MergeMatrix step={step} K={K} />}
  </section>
}
