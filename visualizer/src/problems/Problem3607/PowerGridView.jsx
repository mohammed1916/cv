import DisjointSetView from '../../components/shared/DisjointSetView'
import OperationLog from '../../components/shared/OperationLog'
import { graphCircleLayout } from '../../components/shared/graphTraversalModel.js'

const W = 420
const H = 300
const TONES = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--info)', 'var(--error)', 'var(--accent)']

// Stations on a ring coloured by grid, then each grid's sorted list with its one-way pointer.
export default function PowerGridView({ run, step }) {
  const { c, connections } = run.input
  const points = graphCircleLayout(c, W, H)
  const roots = [...new Set(step.gridOf)]
  const toneOf = root => TONES[roots.indexOf(root) % TONES.length]
  const building = step.phase === 'start' || step.phase === 'union' || (step.phase === 'group' && step.queryIndex < 0)
  const isCable = (u, v) => step.cable && ((step.cable[0] === u && step.cable[1] === v) || (step.cable[0] === v && step.cable[1] === u))
  const labels = step.parent.map((_, i) => String(i + 1))
  return <section aria-label="Power grids" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Stations and cables" style={{ width: '100%', maxWidth: 520, maxHeight: 340 }}>
      {connections.map(([u, v], i) => {
        const a = points[u - 1], b = points[v - 1]
        const hot = isCable(u, v)
        return <line key={i} data-cable={`${u},${v}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hot ? 'var(--warning)' : 'var(--border)'} strokeWidth={hot ? 4 : 2} />
      })}
      {points.map((p, i) => {
        const station = i + 1
        const on = step.online[i]
        const tone = toneOf(step.gridOf[i])
        const isFocus = step.focus === station
        const isAnswer = step.answered === station
        return <g key={station} data-station={station} data-online={on} data-grid={step.gridOf[i]}>
          {(isFocus || isAnswer) && <circle cx={p.x} cy={p.y} r={25} fill="none" stroke={isAnswer ? 'var(--success)' : 'var(--warning)'} strokeWidth={3} />}
          <circle cx={p.x} cy={p.y} r={19} fill={on ? `color-mix(in srgb, ${tone} 32%, var(--surface2))` : 'var(--surface3)'} stroke={tone} strokeWidth={3} strokeDasharray={on ? undefined : '4 3'} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="13" fontWeight={700} fill={on ? 'var(--text)' : 'var(--text-muted)'} textDecoration={on ? undefined : 'line-through'}>{station}</text>
        </g>
      })}
    </svg>
    <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-muted)' }}>
      Ring colour shows the grid. A dashed ring with a struck-through number is offline. Orange ring: the station in focus. Green ring: the station answering.
    </p>
    {building && <DisjointSetView parent={step.parent} size={step.size} labels={labels} ops={step.ops} />}
    {step.members.length > 0 && <section aria-label="Grid lists">
      <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>Each grid's stations, smallest first, with its front pointer</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {step.members.map(grid => {
          const position = step.front[grid.root]
          const tone = toneOf(grid.root)
          const active = step.grid === grid.root
          const exhausted = position !== undefined && position >= grid.ids.length
          return <div key={grid.root} data-root={grid.root} aria-current={active ? 'true' : undefined}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 4, padding: 6, borderRadius: 6, borderLeft: `4px solid ${tone}`, background: active ? 'var(--surface2)' : 'transparent' }}>
            <span style={{ minWidth: 76, fontSize: '.78rem', color: 'var(--text-muted)' }}>root {grid.root}</span>
            {grid.ids.map((id, i) => {
              const on = step.online[id - 1]
              const here = position === i
              return <div key={id} data-lane-station={id} style={{ textAlign: 'center' }}>
                <small style={{ display: 'block', height: 16, fontWeight: 700, color: 'var(--text)' }}>{here ? 'front ↓' : ''}</small>
                <div style={{ minWidth: 34, padding: '4px 6px', borderRadius: 5, background: on ? 'var(--surface2)' : 'var(--surface3)', border: `${step.skipped === id || step.answered === id || here ? 2 : 1}px solid ${step.answered === id ? 'var(--success)' : step.skipped === id ? 'var(--warning)' : here ? tone : 'var(--border)'}`, color: on ? 'var(--text)' : 'var(--text-muted)', textDecoration: on ? 'none' : 'line-through' }}>{id}</div>
              </div>
            })}
            {exhausted && <span data-exhausted style={{ fontWeight: 700, paddingBottom: 4, color: 'var(--text)' }}>front ↓ past the end: -1</span>}
          </div>
        })}
      </div>
    </section>}
    {step.queryIndex >= 0 && <OperationLog title="Queries" ops={step.log} current={step.queryIndex} through={step.queryIndex} />}
  </section>
}
