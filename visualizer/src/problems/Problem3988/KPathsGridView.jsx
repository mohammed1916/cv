import MatrixGrid from '../../components/shared/MatrixGrid'

const CELL = 46, GAP = 3
const center = i => i * (CELL + GAP) + CELL / 2

// The grid being carved, with route counts appearing as they are added up. A traced route is drawn on top.
// Beside it is the free-grid table that sets the ceiling, and the rows being built.
export default function KPathsGridView({ run, step }) {
  const { m, n, k } = run.input
  const freeWays = Array.from({ length: m }, () => Array(n).fill(1))
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) freeWays[r][c] = freeWays[r - 1][c] + freeWays[r][c - 1]
  const width = n * (CELL + GAP) - GAP, height = m * (CELL + GAP) - GAP
  const isIn = (list, r, c) => list.some(([a, b]) => a === r && b === c)
  const done = step.phase === 'done'
  return <section aria-label="Grid with exactly k routes" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, color: 'var(--text)', alignItems: 'flex-start' }}>
    <div>
      <strong style={{ display: 'block', marginBottom: 6 }}>Grid being built (target k = {k})</strong>
      <div style={{ position: 'relative', width, height }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${CELL}px)`, gap: GAP }}>
          {step.grid.flatMap((row, r) => [...row].map((ch, c) => {
            const active = step.active && step.active[0] === r && step.active[1] === c
            const source = isIn(step.from, r, c)
            const onPath = step.path && isIn(step.path, r, c)
            const corner = r === m - 1 && c === n - 1
            return <div key={`${r},${c}`} data-cell={`${r},${c}`} data-state={ch === '#' ? 'blocked' : 'free'} data-active={Boolean(active)} data-source={source}
              style={{ width: CELL, height: CELL, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, fontWeight: 700,
                background: ch === '#' ? 'var(--surface2)' : active ? 'color-mix(in srgb, var(--primary) 24%, var(--surface2))' : source ? 'color-mix(in srgb, var(--warning) 24%, var(--surface2))' : onPath ? 'color-mix(in srgb, var(--success) 24%, var(--surface2))' : 'var(--surface)',
                border: active ? '3px solid var(--primary)' : corner ? '2px solid var(--success)' : '1px solid var(--border)', color: ch === '#' ? 'var(--text-muted)' : 'var(--text)' }}>
              {ch === '#' ? '#' : step.ways[r][c] ?? ''}
            </div>
          }))}
        </div>
        <svg width={width} height={height} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {step.from.map(([r, c], i) => <line key={i} x1={center(c)} y1={center(r)} x2={center(step.active[1])} y2={center(step.active[0])} stroke="var(--warning)" strokeWidth="3" />)}
          {step.path && <polyline points={step.path.map(([r, c]) => `${center(c)},${center(r)}`).join(' ')} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round" opacity="0.8" />}
        </svg>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}># is blocked. A number is how many routes reach that cell.</p>
    </div>
    <div style={{ display: 'grid', gap: 12, fontSize: 13, minWidth: 200 }}>
      <div>
        <strong style={{ display: 'block', marginBottom: 4 }}>Routes with nothing blocked: {run.limit} (k = {k} {k > run.limit ? 'is too large' : 'fits'})</strong>
        <MatrixGrid matrix={freeWays} label="Routes in a fully free grid" activeCell={{ row: m - 1, col: n - 1 }} showCoordinates={false} cellWidth={44} cellHeight={28} />
      </div>
      {run.paths.length > 0 && step.pathIndex >= 0 && <div><strong>Route {step.pathIndex + 1} of {run.paths.length}</strong></div>}
      <div><strong>{done ? 'Returned' : 'Rows so far'}</strong>
        {done && run.result.length === 0 ? <pre style={{ margin: '4px 0 0' }}>[]</pre> : <pre style={{ margin: '4px 0 0', color: 'var(--text)' }}>{step.grid.join('\n')}</pre>}
      </div>
    </div>
  </section>
}
