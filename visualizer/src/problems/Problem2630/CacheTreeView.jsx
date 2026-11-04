import RecordStateTable from '../../components/shared/RecordStateTable'
import SvgViewport from '../../components/shared/SvgViewport'
import { layoutRootedTree } from '../../components/shared/treeLayout'

const GAP_X = 128
const GAP_Y = 96
const PAD = 40
const RADIUS = 16

function collect(node, into = new Map()) {
  into.set(node.id, node)
  node.children.forEach(child => collect(child, into))
  return into
}

const shorten = (text, size) => (text.length > size ? `${text.slice(0, size - 1)}…` : text)

function ArgumentRail({ step }) {
  if (step.callIndex < 0) return <p style={{ margin: 0, color: 'var(--text-muted)' }}>Waiting for the first call.</p>
  return <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
    <code style={{ color: 'var(--text)' }}>memoized(</code>
    {step.args.length === 0 && <span style={{ color: 'var(--text-muted)' }}>no arguments</span>}
    {step.args.map((label, i) => {
      const read = i <= step.argIndex || step.outcome
      const now = i === step.argIndex
      return <span key={i} data-role={now ? 'current' : read ? 'read' : 'waiting'} style={{
        padding: '3px 8px', borderRadius: 6, color: 'var(--text)',
        border: `2px solid ${now ? 'var(--primary)' : 'var(--border)'}`,
        background: read ? 'color-mix(in srgb, var(--primary) 16%, var(--surface2))' : 'var(--surface2)',
      }}>{label}</span>
    })}
    <code style={{ color: 'var(--text)' }}>)</code>
  </div>
}

function CacheTree({ step }) {
  const nodes = collect(step.tree)
  const layout = layoutRootedTree(step.tree)
  const at = id => {
    const p = layout.positions.get(id)
    return { x: p.x * GAP_X + PAD + 40, y: p.depth * GAP_Y + PAD }
  }
  const width = Math.max(layout.columns, 1) * GAP_X + PAD * 2
  const height = (layout.rows - 1) * GAP_Y + PAD * 2 + 26
  const onPath = new Set(step.path)
  return <section aria-label="Cache tree">
    <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>Cache tree: one level per argument position</h3>
    <SvgViewport width={width} height={height}>
      {layout.edges.map(([from, to]) => {
        const a = at(from), b = at(to)
        const active = onPath.has(from) && onPath.has(to)
        return <g key={`${from}-${to}`}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? 'var(--primary)' : 'var(--border)'} strokeWidth={active ? 3 : 1.5} />
          <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle" fontSize="11" fill="var(--text)" stroke="var(--surface)" strokeWidth="3" paintOrder="stroke">
            {shorten(nodes.get(to).label, 18)}
            <title>{nodes.get(to).label}</title>
          </text>
        </g>
      })}
      {[...nodes.values()].map(node => {
        const { x, y } = at(node.id)
        const focus = node.id === step.focus
        return <g key={node.id} data-node={node.id} data-role={focus ? 'focus' : onPath.has(node.id) ? 'path' : node.done ? 'stored' : ''}>
          <circle cx={x} cy={y} r={RADIUS}
            fill={focus ? 'color-mix(in srgb, var(--primary) 30%, var(--surface))' : 'var(--surface2)'}
            stroke={node.done ? 'var(--success)' : onPath.has(node.id) ? 'var(--primary)' : 'var(--border)'}
            strokeWidth={node.done || focus ? 3 : 1.5} />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="var(--text)">{node.id === 0 ? 'root' : node.id}</text>
          {node.valueText !== null && <text x={x} y={y + RADIUS + 15} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)">
            = {shorten(node.valueText, 16)}
            <title>{node.valueText}</title>
          </text>}
        </g>
      })}
    </SvgViewport>
    <p style={{ margin: '4px 0 0', fontSize: '.75rem', color: 'var(--text-muted)' }}>
      Green ring: a stored value. Purple path: the arguments read so far in this call.
    </p>
  </section>
}

// Shows the walk through the tree of arguments, the fn counter and every call's answer.
export default function CacheTreeView({ run, step }) {
  const rows = run.input.calls.map((_, i) => {
    const entry = step.log[i]
    return {
      call: i + 1,
      outcome: entry ? (entry.outcome === 'hit' ? 'cache hit' : 'fn ran') : i === step.callIndex ? 'running' : '',
      val: entry ? entry.valueText : '',
      calls: entry ? entry.calls : '',
    }
  })
  const badge = step.outcome === 'hit' ? { text: 'HIT: fn stays idle', color: 'var(--success)' }
    : step.outcome === 'miss' ? { text: 'MISS: fn runs', color: 'var(--warning)' } : null
  return <section aria-label="Memoized calls" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
      <ArgumentRail step={step} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {badge && <strong data-outcome={step.outcome} style={{ color: badge.color, border: `2px solid ${badge.color}`, borderRadius: 6, padding: '3px 8px' }}>{badge.text}</strong>}
        <output aria-label="Times fn has run" style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', background: 'var(--surface2)' }}>fn runs: <strong>{step.fnCalls}</strong></output>
      </div>
    </div>
    {step.lookalike && <p role="note" style={{ margin: 0, padding: '6px 10px', borderLeft: '4px solid var(--warning)', background: 'var(--surface2)' }}>
      <code>{step.lookalike.incoming}</code> looks like <code>{step.lookalike.existing}</code>, yet <code>===</code> compares identity, not contents.
    </p>}
    <CacheTree step={step} />
    <RecordStateTable label={`Answers for fn = ${run.input.fn}`} columns={['call', 'outcome', 'val', 'calls']} rows={rows} activeRow={step.callIndex} />
  </section>
}
