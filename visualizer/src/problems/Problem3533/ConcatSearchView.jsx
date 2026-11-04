import { useEffect, useMemo, useRef } from 'react'

const COLUMN = 46
const ROW = 62
const RADIUS = 15

function layoutTree(nodes) {
  const children = new Map(nodes.map(node => [node.id, []]))
  nodes.forEach(node => { if (node.parent !== null) children.get(node.parent).push(node.id) })
  const x = new Map()
  let nextLeaf = 0
  const place = id => {
    const kids = children.get(id)
    if (!kids.length) { x.set(id, nextLeaf++); return }
    kids.forEach(place)
    x.set(id, (x.get(kids[0]) + x.get(kids[kids.length - 1])) / 2)
  }
  if (nodes.length) place(0)
  return { x, leaves: Math.max(1, nextLeaf) }
}

const usedValues = (mask, nums) => nums.filter((_, index) => mask >> index & 1)

const OUTCOME = {
  found: { stroke: 'var(--success)', fill: 'var(--success-glow)', mark: '✓', word: 'succeeds' },
  miss: { stroke: 'var(--error)', fill: 'var(--error-glow)', mark: '✗', word: 'wrong remainder' },
  dead: { stroke: 'var(--error)', fill: 'var(--error-glow)', mark: '✗', word: 'all choices failed' },
  seen: { stroke: 'var(--warning)', fill: 'var(--warning-glow)', mark: '↺', word: 'known dead' },
}

// The search tree: edges are numbers appended, nodes are the remainder after them.
function SearchTree({ run, step }) {
  const { x, leaves } = useMemo(() => layoutTree(run.nodes), [run.nodes])
  const scroller = useRef(null)
  const width = leaves * COLUMN + 16
  const depth = run.input.nums.length
  const height = depth * ROW + 2 * RADIUS + 24
  const cx = id => x.get(id) * COLUMN + COLUMN / 2 + 8
  const cy = node => node.depth * ROW + RADIUS + 8
  useEffect(() => {
    const box = scroller.current
    if (!box || step.nodeId === null) return
    box.scrollLeft = cx(step.nodeId) - box.clientWidth / 2
  }, [step.nodeId, x])
  const visible = run.nodes.filter(node => node.enter <= step.at)
  const resolved = node => node.exit !== null && node.exit <= step.at
  return <div ref={scroller} style={{ overflowX: 'auto' }}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Search tree of appended numbers" style={{ display: 'block' }}>
      {visible.filter(node => node.parent !== null).map(node => {
        const parent = run.nodes[node.parent]
        const onPath = !resolved(node)
        const style = resolved(node) ? OUTCOME[node.outcome].stroke : 'var(--primary)'
        return <g key={`edge-${node.id}`} data-edge={node.id}>
          <line x1={cx(parent.id)} y1={cy(parent)} x2={cx(node.id)} y2={cy(node)} stroke={style} strokeWidth={onPath ? 3 : 1.5} strokeDasharray={node.outcome === 'seen' && resolved(node) ? '4 3' : undefined} />
          <text x={(cx(parent.id) + cx(node.id)) / 2 + 3} y={(cy(parent) + cy(node)) / 2 + 2} fontSize="11" fontWeight="700" fill="var(--text)" paintOrder="stroke" stroke="var(--surface)" strokeWidth="3">{run.input.nums[node.via]}</text>
        </g>
      })}
      {visible.map(node => {
        const done = resolved(node)
        const look = done ? OUTCOME[node.outcome] : null
        const active = node.id === step.nodeId
        return <g key={node.id} data-node={node.id} data-outcome={done ? node.outcome : 'open'} data-active={active || undefined}>
          <circle cx={cx(node.id)} cy={cy(node)} r={RADIUS} fill={look ? look.fill : active ? 'var(--primary-glow)' : 'var(--surface2)'} stroke={look ? look.stroke : 'var(--primary)'} strokeWidth={active ? 3 : 1.5} />
          <text x={cx(node.id)} y={cy(node) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">{node.r}</text>
          {look && <text x={cx(node.id) + RADIUS + 1} y={cy(node) - RADIUS + 5} fontSize="12" fontWeight="700" fill={look.stroke}>{look.mark}</text>}
        </g>
      })}
    </svg>
  </div>
}

function Memo({ run, step }) {
  const groups = new Map()
  run.deadLog.filter(entry => entry.at <= step.at).forEach(entry => {
    if (!groups.has(entry.mask)) groups.set(entry.mask, [])
    groups.get(entry.mask).push(entry.r)
  })
  const nums = run.input.nums
  const highlight = step.phase === 'memo' || step.phase === 'dead'
  return <div aria-label="States known to fail">
    <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>States known to fail</h3>
    {groups.size === 0 ? <p style={{ margin: 0, color: 'var(--text-muted)' }}>None yet.</p> : <div style={{ display: 'grid', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
      {[...groups].map(([mask, rs]) => <div key={mask} data-mask={mask} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ minWidth: 110 }}>used {'{'}{usedValues(mask, nums).join(', ')}{'}'}</span>
        {rs.map(r => {
          const hit = highlight && step.mask === mask && step.r === r
          return <span key={r} data-dead-r={r} style={{ padding: '1px 8px', borderRadius: 999, color: 'var(--text)', background: hit ? 'var(--warning-glow)' : 'var(--error-glow)', border: `${hit ? 2 : 1}px solid ${hit ? 'var(--warning)' : 'var(--error)'}` }}>r = {r}</span>
        })}
      </div>)}
    </div>}
  </div>
}

export default function ConcatSearchView({ run, step }) {
  const { nums, k } = run.input
  const finalAnswer = step.done ? run.result : null
  return <section aria-label="Bitmask search for a divisible concatenation" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }} aria-label="Sorted numbers">
      <strong>sorted</strong>
      {nums.map((value, index) => {
        const used = step.path.includes(index)
        const candidate = step.candidate === index
        return <span key={index} data-index={index} data-used={used || undefined} data-candidate={candidate || undefined} style={{ padding: '4px 10px', borderRadius: 6, color: 'var(--text)', fontWeight: 700, background: candidate ? 'var(--primary-glow)' : used ? 'var(--surface3)' : 'var(--surface2)', border: `2px ${candidate ? 'dashed' : 'solid'} ${candidate ? 'var(--primary)' : 'var(--border)'}`, textDecoration: used ? 'line-through' : 'none' }}>{value}</span>
      })}
      <strong style={{ marginLeft: 12 }}>k = {k}</strong>
    </div>

    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div style={{ padding: 10, background: 'var(--surface2)', borderRadius: 8, minWidth: 200 }}>
        <small style={{ color: 'var(--text-muted)' }}>{finalAnswer ? 'answer' : 'written so far'}</small>
        <div data-written style={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', minHeight: 30 }}>
          {finalAnswer
            ? (finalAnswer.length ? finalAnswer.map((value, index) => <span key={index} style={{ padding: '0 4px', borderRadius: 4, background: 'var(--success-glow)' }}>{value}</span>) : <span>empty list</span>)
            : step.path.length ? step.path.map((index, position) => <span key={position} style={{ padding: '0 4px', borderRadius: 4, background: 'var(--surface3)' }}>{nums[index]}</span>) : <span style={{ color: 'var(--text-muted)' }}>nothing</span>}
          {step.candidate !== null && step.calc && <span style={{ padding: '0 4px', borderRadius: 4, border: '2px dashed var(--primary)' }}>{nums[step.candidate]}</span>}
        </div>
      </div>
      <div style={{ padding: 10, background: 'var(--surface2)', borderRadius: 8, minWidth: 240 }}>
        <small style={{ color: 'var(--text-muted)' }}>remainder update</small>
        {step.calc
          ? <div data-calc style={{ fontSize: 16, fontFamily: 'var(--font-mono, monospace)' }}>({step.calc.r} × {step.calc.power} + {step.calc.value}) mod {step.calc.k} = <strong>{step.calc.next}</strong></div>
          : <div style={{ fontSize: 16 }}>remainder {step.nodeId === null ? '—' : <strong>{step.r}</strong>}</div>}
      </div>
    </div>

    <div>
      <h3 style={{ margin: '0 0 2px', fontSize: 15 }}>Search tree</h3>
      <p style={{ margin: '0 0 6px', color: 'var(--text-muted)' }}>Each edge appends a number; each circle holds the remainder after it. Left branches are tried first. ✓ succeeds, ✗ fails, ↺ skipped as known dead.</p>
      <SearchTree run={run} step={step} />
    </div>

    <Memo run={run} step={step} />
  </section>
}
