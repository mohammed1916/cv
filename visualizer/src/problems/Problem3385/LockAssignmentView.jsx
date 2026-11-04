const cellBase = { width: 62, height: 50, textAlign: 'center', border: '1px solid var(--border)', padding: 2 }

// Left: the cost matrix with lock and slot prices, reduced cost under each entry, and the search state along the bottom.
// Below: the timeline that the current assignment produces, so a matrix cell reads as real minutes.
export default function LockAssignmentView({ run, step }) {
  const { cost } = run
  const { strength } = run.input
  const n = strength.length
  const rows = Array.from({ length: n }, (_, i) => i + 1)
  const slots = rows
  const isAdded = i => i <= step.lock || step.match.includes(i)
  const fill = (i, j) => {
    if (step.moved === j && step.match[j] === i) return 'var(--primary-glow)'
    if (step.match[j] === i) return 'var(--success-glow)'
    if (step.row === i && step.slot === j) return 'var(--primary-glow)'
    return step.used[j] ? 'var(--surface3)' : 'var(--surface)'
  }
  return <section aria-label="Lock assignment" style={{ display: 'grid', gap: 14, color: 'var(--text)', overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', background: 'var(--surface)' }} aria-label="Cost matrix: minutes for each lock in each slot">
      <thead><tr>
        <th style={{ ...cellBase, width: 110, background: 'var(--surface2)' }}>lock \ slot</th>
        {slots.map(j => <th key={j} scope="col" data-slot={j} data-used={step.used[j]} style={{ ...cellBase, background: step.pick === j ? 'var(--warning-glow)' : step.used[j] ? 'var(--surface3)' : 'var(--surface2)' }}>
          X = {j}<small style={{ display: 'block', fontWeight: 400, color: 'var(--text-muted)' }}>price {step.v[j]}</small>
        </th>)}
      </tr></thead>
      <tbody>
        {rows.map(i => <tr key={i} style={{ opacity: i <= step.filled ? 1 : 0.25 }}>
          <th scope="row" data-lock={i} style={{ ...cellBase, width: 110, background: step.row === i ? 'var(--primary-glow)' : 'var(--surface2)' }}>
            Lock {i} ({strength[i - 1]})<small style={{ display: 'block', fontWeight: 400, color: 'var(--text-muted)' }}>price {step.u[i]}</small>
          </th>
          {slots.map(j => {
            const reduced = cost[i - 1][j - 1] - step.u[i] - step.v[j]
            const assigned = step.match[j] === i
            const active = step.row === i && step.slot === j
            return <td key={j} data-cell={`${i},${j}`} data-assigned={assigned} data-active={active}
              style={{ ...cellBase, background: fill(i, j), outline: active ? '3px solid var(--primary)' : assigned ? '2px solid var(--success)' : 'none', outlineOffset: -2 }}>
              {i <= step.filled ? <>
                <strong style={{ display: 'block' }}>{cost[i - 1][j - 1]}</strong>
                {isAdded(i) && <small style={{ color: reduced === 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: reduced === 0 ? 700 : 400 }}>{reduced === 0 ? 'tight 0' : `left ${reduced}`}</small>}
              </> : ''}
            </td>
          })}
        </tr>)}
        <tr>
          <th scope="row" style={{ ...cellBase, width: 110, background: 'var(--surface2)', fontWeight: 400 }}>best way in</th>
          {slots.map(j => <td key={j} style={{ ...cellBase, background: step.pick === j ? 'var(--warning-glow)' : 'var(--surface2)' }}>
            {step.used[j] ? <small style={{ color: 'var(--text-muted)' }}>visited</small> : step.best[j] === null ? '—' : <><strong style={{ display: 'block' }}>{step.best[j]}</strong><small style={{ color: 'var(--text-muted)' }}>{step.way[j] ? `via X = ${step.way[j]}` : 'direct'}</small></>}
          </td>)}
        </tr>
      </tbody>
    </table>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
      <span>Finding a slot for: <strong>{step.lock ? `Lock ${step.lock}` : '—'}</strong></span>
      <span>delta: <strong>{step.delta ?? '—'}</strong></span>
      {step.reduced !== undefined && <span>this cell, after prices: <strong>{step.reduced}</strong></span>}
    </div>
    <div aria-label="Sword timeline for the current assignment">
      <strong style={{ display: 'block', marginBottom: 6 }}>Sword timeline</strong>
      <div style={{ display: 'grid', gap: 4 }}>{slots.map(j => {
        const lock = step.match[j]
        const minutes = lock ? cost[lock - 1][j - 1] : 0
        const peak = Math.max(...cost.map(row => row[0]))
        return <div key={j} data-timeline-slot={j} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>X = {j}: {lock ? `Lock ${lock}, ${minutes} min` : 'free'}</span>
          <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 16 }}>
            {lock > 0 && <div style={{ width: `${Math.max(4, (minutes / peak) * 100)}%`, height: '100%', borderRadius: 4, background: 'var(--primary)' }} />}
          </div>
        </div>
      })}</div>
      {step.phase === 'done' && <output style={{ display: 'block', marginTop: 8 }}>Total {run.result} min. Increasing strength order: {run.sortedTotal} min.</output>}
    </div>
  </section>
}
