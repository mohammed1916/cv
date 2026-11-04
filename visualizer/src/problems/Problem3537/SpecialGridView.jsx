import { QUADRANTS } from './algorithm'

const tint = (token, percent) => `color-mix(in srgb, var(${token}) ${percent}%, transparent)`

// The grid shows where values land; the stack shows which block of values each open square still has to hand out.
export default function SpecialGridView({ run, step }) {
  return <section aria-label="Special grid and recursion stack" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start', color: 'var(--text)' }}>
    <GridPicture step={step} n={run.input.n} />
    <div style={{ flex: '1 1 260px', minWidth: 0, display: 'grid', gap: 8 }}>
      <CallStack step={step} />
      {step.compare && <p style={{ margin: 0, padding: 8, borderRadius: 6, background: tint('--success', 14) }}>
        <strong>{step.compare.a} max {step.compare.maxA}</strong> &lt; <strong>{step.compare.b} min {step.compare.minB}</strong>
      </p>}
    </div>
  </section>
}

function GridPicture({ step, n }) {
  const side = step.grid.length
  const unit = n >= 4 ? 30 : n === 3 ? 42 : 60
  const pad = 4
  const size = side * unit + pad * 2
  const maxValue = side * side - 1 || 1
  const rect = (block, style, key) => <rect key={key} x={pad + block.left * unit} y={pad + block.top * unit} width={block.size * unit} height={block.size * unit} fill="none" style={style} />
  return <svg viewBox={`0 0 ${size} ${size}`} width={size} style={{ maxWidth: '100%', height: 'auto', flex: '0 0 auto' }} role="img" aria-label={`${side} by ${side} grid`}>
    {step.grid.map((row, r) => row.map((value, c) => <g key={`${r}:${c}`} data-row={r} data-col={c}>
      <rect x={pad + c * unit} y={pad + r * unit} width={unit} height={unit}
        style={{ fill: value === null ? 'var(--surface2)' : tint('--primary', 8 + Math.round((42 * value) / maxValue)), stroke: 'var(--border)' }} />
      {value !== null && <text x={pad + c * unit + unit / 2} y={pad + r * unit + unit / 2} dy="0.35em" textAnchor="middle" fontSize={n >= 4 ? 11 : 14} style={{ fill: 'var(--text)' }}>{value}</text>}
    </g>))}
    {step.stack.filter(entry => entry.size !== step.block?.size).map((entry, index) => rect(entry, { stroke: 'var(--text-muted)', strokeWidth: 1.5, strokeDasharray: '5 3' }, `open-${index}`))}
    {(step.blocks ?? []).map((block, index) => rect(block, { stroke: 'var(--success)', strokeWidth: 3 }, `check-${index}`))}
    {step.block && rect(step.block, { stroke: 'var(--primary)', strokeWidth: 3 }, 'active')}
    {step.placed && rect({ top: step.placed.row, left: step.placed.col, size: 1 }, { stroke: 'var(--warning)', strokeWidth: 3 }, 'placed')}
  </svg>
}

function CallStack({ step }) {
  if (!step.stack.length) return <p style={{ margin: 0, color: 'var(--text-muted)' }}>{step.phase === 'start' ? 'No square is open yet.' : 'Every square is finished.'}</p>
  return <ol aria-label="Open squares, outermost first" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
    {step.stack.map((entry, depth) => {
      const share = entry.size * entry.size / 4
      const isInnermost = depth === step.stack.length - 1
      return <li key={depth} aria-current={isInnermost ? 'step' : undefined} style={{ padding: 6, borderRadius: 6, background: 'var(--surface2)', border: `1px solid ${isInnermost ? 'var(--primary)' : 'var(--border)'}` }}>
        <div style={{ fontSize: 13 }}>{entry.size} by {entry.size} at row {entry.top}, column {entry.left} · values {entry.first}..{entry.first + entry.size * entry.size - 1}</div>
        {entry.size > 1 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {QUADRANTS.map((quadrant, index) => {
            const state = index < entry.child ? 'done' : index === entry.child ? 'current' : 'waiting'
            return <span key={quadrant.short} data-state={state} title={quadrant.name} style={{ fontSize: 12, padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)', opacity: state === 'waiting' ? 0.6 : 1, fontWeight: state === 'current' ? 700 : 400, background: state === 'done' ? tint('--success', 18) : state === 'current' ? tint('--primary', 24) : 'transparent' }}>
              {quadrant.short} {entry.first + index * share}{share > 1 ? `..${entry.first + (index + 1) * share - 1}` : ''}
            </span>
          })}
        </div>}
      </li>
    })}
  </ol>
}
