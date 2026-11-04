import { CYCLE, cellKey, neighbours } from './algorithm'

const SIDE = 40
const HEIGHT = SIDE * Math.sqrt(3) / 2
const GUTTER = 58

// Corners of slot j in a given row, with the apex of the whole figure at x = 0.
function corners(row, j) {
  const k = Math.floor((j - 1) / 2)
  const apexX = (k - (row - 1) / 2) * SIDE
  const top = (row - 1) * HEIGHT
  const bottom = row * HEIGHT
  if (j % 2 === 1) return [[apexX, top], [apexX - SIDE / 2, bottom], [apexX + SIDE / 2, bottom]]
  return [[apexX, top], [apexX + SIDE, top], [apexX + SIDE / 2, bottom]]
}

function centre(points) {
  return [points.reduce((s, p) => s + p[0], 0) / 3, points.reduce((s, p) => s + p[1], 0) / 3]
}

// Draws the real triangle: seeds, cells filled by spreading, and each white cell's count of red neighbours.
export default function TriangleView({ run, step }) {
  const { n } = run.input
  const seeds = new Set(step.seeds)
  const red = new Set(step.red)
  const support = new Set(step.support.map(([r, j]) => cellKey(r, j)))
  const focus = step.focus ? cellKey(step.focus[0], step.focus[1]) : null
  const width = n * SIDE
  const pad = 8
  const cells = []
  for (let row = 1; row <= n; row++) {
    for (let j = 1; j < 2 * row; j++) {
      const key = cellKey(row, j)
      const points = corners(row, j)
      const [cx, cy] = centre(points)
      const isSeed = seeds.has(key)
      const isRed = red.has(key)
      const count = neighbours(row, j, n).filter(([a, b]) => red.has(cellKey(a, b))).length
      const fill = isSeed ? 'var(--primary)' : isRed ? 'color-mix(in srgb, var(--primary) 38%, var(--surface2))' : 'var(--surface2)'
      const stroke = key === focus ? 'var(--warning)' : support.has(key) ? 'var(--success)' : 'var(--border)'
      cells.push({ key, row, j, points, cx, cy, isSeed, isRed, count, fill, stroke, wide: key === focus || support.has(key) })
    }
  }
  // Highlighted outlines paint last so that neighbouring cells cannot cover them.
  cells.sort((a, b) => Number(a.wide) - Number(b.wide))
  const whiteLeft = n * n - red.size
  return <section aria-label="Triangle state" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <dl style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: 0 }}>
      <div><dt>seeds</dt><dd data-testid="seed-count" style={{ margin: 0 }}><strong>{seeds.size}</strong></dd></div>
      <div><dt>red</dt><dd style={{ margin: 0 }}><strong>{red.size}</strong> of {n * n}</dd></div>
      <div><dt>white</dt><dd style={{ margin: 0 }}><strong>{whiteLeft}</strong></dd></div>
      <div><dt>sweep</dt><dd style={{ margin: 0 }}><strong>{step.pass || '–'}</strong></dd></div>
    </dl>
    <svg viewBox={`${-width / 2 - GUTTER} ${-pad} ${width + GUTTER * 2} ${n * HEIGHT + pad * 2}`} role="img"
      aria-label={`Triangle of side ${n} with ${red.size} red cells`} style={{ width: '100%', maxWidth: Math.max(320, width + GUTTER * 2), maxHeight: 460 }}>
      {Array.from({ length: n }, (_, i) => {
        const row = i + 1
        const active = step.row === row
        return <text key={row} x={-row * SIDE / 2 - 8} y={(row - 0.4) * HEIGHT} textAnchor="end" fontSize="11" fontWeight={active ? 700 : 400}
          fill={active ? 'var(--primary)' : 'var(--text-muted)'}>row {row}</text>
      })}
      {cells.map(cell => <g key={cell.key} data-cell={cell.key} data-state={cell.isSeed ? 'seed' : cell.isRed ? 'spread' : 'white'}>
        <polygon points={cell.points.map(p => p.join(',')).join(' ')} fill={cell.fill} stroke={cell.stroke} strokeWidth={cell.wide ? 3 : 1} strokeLinejoin="round" />
        {!cell.isRed && <text x={cell.cx} y={cell.cy + 4} textAnchor="middle" fontSize="11" fontWeight={cell.count >= 2 ? 700 : 400} fill={cell.count >= 2 ? 'var(--text)' : 'var(--text-muted)'}>{cell.count}</text>}
        {cell.isSeed && <text x={cell.cx} y={cell.cy + 4} textAnchor="middle" fontSize="10" fontWeight={700} fill="var(--text-inverse)">S</text>}
      </g>)}
    </svg>
    <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-muted)' }}>
      S marks a seed. Pale red cells were filled by spreading. A number on a white cell counts its red neighbours; it turns red at 2. Orange outline: the cell in focus. Green outline: the neighbours that support it.
    </p>
    <section aria-label="Row cycle">
      <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>Seeding cycle, read from the bottom row upward</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 6 }}>
        {CYCLE.map((entry, index) => <div key={index} data-cycle={index} aria-current={step.cycle === index ? 'step' : undefined}
          style={{ padding: 6, borderRadius: 6, border: `${step.cycle === index ? 2 : 1}px solid ${step.cycle === index ? 'var(--primary)' : 'var(--border)'}`, background: 'var(--surface2)', color: 'var(--text)' }}>
          <strong style={{ display: 'block', fontSize: '.8rem' }}>Step {index}: {entry.name}</strong>
          <small style={{ color: 'var(--text-muted)' }}>{entry.detail}</small>
        </div>)}
      </div>
    </section>
  </section>
}
