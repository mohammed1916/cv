import './RuneGraphView.css'

const SIZE = 340
const R = 120
const NODE = 22

// Runes sit on a ring. Arrows show the given transformations; a dark ring marks an initial rune,
// and a dashed ring marks a group that still needs one added start.
export default function RuneGraphView({ run, step }) {
  if (!run || !step) return <section className="rg-view"><p>Press Play to close the reachability table, then group the runes.</p></section>

  const { n, initial, edges } = run
  const pos = v => {
    const angle = (2 * Math.PI * v) / n - Math.PI / 2
    return [SIZE / 2 + R * Math.cos(angle), SIZE / 2 + R * Math.sin(angle)]
  }
  const palette = ['#0ea5e9', '#f59e0b', '#22c55e', '#e11d48', '#8b5cf6', '#14b8a6', '#f97316', '#64748b']
  const comp = step.comp || []
  const grouped = comp.length === n && comp.every(c => c >= 0)
  const colorOf = v => (grouped ? palette[comp[v] % palette.length] : '#94a3b8')
  const isInitial = v => initial.includes(v)
  const sourceGroup = step.source ?? -1
  const edgeActive = (a, b) => step.edge && step.edge[0] === a && step.edge[1] === b

  return (
    <section className="rg-view" aria-label="Rune transformation graph">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Graph of ${n} runes with ${edges.length} arrows`}>
        <defs>
          <marker id="rg-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="rg-view__arrowhead" />
          </marker>
        </defs>
        {edges.map(([a, b], idx) => {
          const [x1, y1] = pos(a)
          const [x2, y2] = pos(b)
          const dx = x2 - x1
          const dy = y2 - y1
          const len = Math.hypot(dx, dy) || 1
          const sx = x1 + (dx / len) * NODE
          const sy = y1 + (dy / len) * NODE
          const ex = x2 - (dx / len) * (NODE + 4)
          const ey = y2 - (dy / len) * (NODE + 4)
          return (
            <line key={idx} x1={sx} y1={sy} x2={ex} y2={ey}
              className={edgeActive(a, b) ? 'rg-view__edge rg-view__edge--active' : 'rg-view__edge'}
              markerEnd="url(#rg-arrow)" />
          )
        })}
        {Array.from({ length: n }, (_, v) => {
          const [x, y] = pos(v)
          const classes = ['rg-view__node']
          if (isInitial(v)) classes.push('rg-view__node--initial')
          if (grouped && comp[v] === sourceGroup && step.phase === 'source') classes.push('rg-view__node--source')
          return (
            <g key={v} className={classes.join(' ')}>
              <circle cx={x} cy={y} r={NODE} style={{ fill: colorOf(v) }} />
              <text x={x} y={y + 5} textAnchor="middle">{v}</text>
              {grouped && <text x={x} y={y + NODE + 13} textAnchor="middle" className="rg-view__group">{`g${comp[v]}`}</text>}
            </g>
          )
        })}
      </svg>
      <p className="rg-view__legend">
        Solid dark outline: initial rune. Labels g0, g1 and so on name the group a rune reaches and is reached from.
        {step.phase === 'source' && step.source != null && comp[step.source] === step.source && !step.hasIn[step.source] && !step.hasStart[step.source]
          ? ' This group has no arrows in and no start, so it needs one.' : ''}
      </p>
      <dl className="rg-view__stats">
        <div><dt>Runes</dt><dd>{n}</dd></div>
        <div><dt>Initial</dt><dd>{initial.length ? initial.join(', ') : 'none'}</dd></div>
        <div><dt>Groups</dt><dd>{grouped ? new Set(comp).size : 'pending'}</dd></div>
        <div><dt>Answer</dt><dd>{step.answer ?? 'pending'}</dd></div>
      </dl>
    </section>
  )
}
