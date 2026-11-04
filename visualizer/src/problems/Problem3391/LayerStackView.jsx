const SIZE = 22

function Layer({ x, n, on, count, step, leader }) {
  const isActive = step.layer === x
  const isAnswer = step.answer === x
  const isLeader = leader === x
  const cell = step.cell && step.cell[0] === x ? step.cell : null
  return <figure data-layer={x} data-leader={isLeader || undefined} style={{ margin: 0, padding: 8, borderRadius: 8, background: isAnswer ? 'var(--success-glow)' : 'var(--surface2)', border: `2px solid ${isAnswer ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--border)'}` }}>
    <figcaption style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>layer {x}</figcaption>
    <div role="img" aria-label={`Layer ${x} holds ${count} ones`} style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${SIZE}px)`, gap: 2 }}>
      {Array.from({ length: n * n }, (_, i) => {
        const y = Math.floor(i / n), z = i % n
        const bit = on.has(`${x},${y},${z}`)
        const here = cell && cell[1] === y && cell[2] === z
        return <div key={i} title={`(${x}, ${y}, ${z})`} data-bit={bit ? 1 : 0} style={{ width: SIZE, height: SIZE, borderRadius: 3, display: 'grid', placeItems: 'center', fontSize: 12, background: bit ? 'var(--primary)' : 'var(--surface3)', color: bit ? 'var(--text-inverse)' : 'var(--text-dim)', outline: here ? '3px solid var(--warning)' : 'none', outlineOffset: 0 }}>{bit ? 1 : 0}</div>
      })}
    </div>
    <div style={{ marginTop: 8, color: 'var(--text)' }}>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--surface3)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(count / Math.max(1, n * n)) * 100}%`, background: 'var(--success)' }} />
      </div>
      <span>count = <strong>{count}</strong>{isLeader ? ' · leads' : ''}</span>
    </div>
  </figure>
}

// Every layer as its own y by z grid with its count, so the winner can be checked by eye against the heap.
export default function LayerStackView({ step }) {
  const on = new Set(step.on)
  const leader = step.count.reduce((best, c, x) => (c >= step.count[best] ? x : best), 0)
  return <section aria-label="Layers of the matrix" style={{ color: 'var(--text)' }}>
    <p style={{ margin: '0 0 8px', color: 'var(--text-muted)' }}>Each square is one layer x; rows are y and columns are z.</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {Array.from({ length: step.n }, (_, x) => <Layer key={x} x={x} n={step.n} on={on} count={step.count[x]} step={step} leader={leader} />)}
    </div>
    {step.top && <p data-stale={step.stale || undefined} style={{ margin: '10px 0 0', padding: 8, borderRadius: 6, color: 'var(--text)', background: step.stale ? 'var(--error-glow)' : 'var(--success-glow)' }}>
      Heap top {step.top.count}@{step.top.x} against count[{step.top.x}] = {step.count[step.top.x]}: {step.stale ? 'out of date, discard' : 'matches, trust it'}
    </p>}
  </section>
}
