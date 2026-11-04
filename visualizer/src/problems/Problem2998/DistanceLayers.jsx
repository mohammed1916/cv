// Breadth-first layers: one column per operation count, holding every value discovered so far.
export default function DistanceLayers({ seen = [], current = null, target }) {
  const maxDistance = seen.reduce((m, row) => Math.max(m, row.distance), 0)
  const layers = Array.from({ length: maxDistance + 1 }, (_, d) => seen.filter(row => row.distance === d).map(row => row.value).sort((a, b) => a - b))
  return <section aria-label="Values by operation count" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '6px 0' }}>
    {layers.map((values, d) => <div key={d} style={{ minWidth: 70, color: 'var(--text)' }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{d} operation{d === 1 ? '' : 's'}</div>
      <div style={{ display: 'grid', gap: 4 }}>
        {values.map(value => <span key={value} style={{
          padding: '3px 8px', borderRadius: 6, textAlign: 'center', fontFamily: 'monospace',
          border: `2px solid ${value === target ? 'var(--primary)' : 'var(--surface2)'}`,
          background: value === current ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
          fontWeight: value === current ? 700 : 400,
        }}>{value}{value === current ? ' (current)' : ''}</span>)}
      </div>
    </div>)}
  </section>
}
