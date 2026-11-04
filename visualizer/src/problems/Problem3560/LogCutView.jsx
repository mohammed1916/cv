const W = 560
const LEFT = 46
const BAR = 24

// Logs to scale against k, the three trucks, and the cost of each tried cut as an a-by-b rectangle.
export default function LogCutView({ run, step }) {
  const { n, m, k } = run.input
  const max = Math.max(n, m, k)
  const scale = (W - LEFT - 12) / max
  const px = v => Math.max(3, v * scale)
  const limitX = LEFT + k * scale
  const longName = n >= m ? 'n' : 'm'
  const log = (name, value, y) => {
    const isLong = step.longest !== null && name === longName
    const cut = isLong && step.cut ? step.cut : null
    const fill = 'color-mix(in srgb, var(--primary) 26%, var(--surface2))'
    return <g key={name} data-log={name}>
      <text x={LEFT - 8} y={y + 16} textAnchor="end" fontSize="13" fill="var(--text)">{name}</text>
      {cut
        ? <>
          <rect x={LEFT} y={y} width={px(cut.a)} height={BAR} fill="color-mix(in srgb, var(--success) 30%, var(--surface2))" stroke="var(--text)" />
          <rect x={LEFT + px(cut.a)} y={y} width={px(cut.b)} height={BAR} fill={fill} stroke="var(--text)" />
          <text x={LEFT + px(cut.a) / 2} y={y + 16} textAnchor="middle" fontSize="12" fill="var(--text)">{px(cut.a) > 34 ? cut.a : ''}</text>
          <text x={LEFT + px(cut.a) + px(cut.b) / 2} y={y + 16} textAnchor="middle" fontSize="12" fill="var(--text)">{px(cut.b) > 34 ? cut.b : ''}</text>
        </>
        : <>
          <rect x={LEFT} y={y} width={px(value)} height={BAR} fill={isLong ? fill : 'var(--surface2)'} stroke={value > k ? 'var(--error)' : 'var(--text)'} strokeWidth={value > k ? 2 : 1} />
          <text x={LEFT + px(value) / 2} y={y + 16} textAnchor="middle" fontSize="12" fill="var(--text)">{px(value) > 34 ? value : ''}</text>
        </>}
    </g>
  }
  const tried = step.tried
  const worst = Math.max(1, ...tried.map(t => t.cost))
  const current = step.cut
  const rectScale = current ? 120 / Math.max(current.a, current.b) : 1
  return <section aria-label="Logs, trucks and cut costs" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <svg viewBox={`0 0 ${W} 120`} style={{ width: '100%', maxWidth: W, display: 'block' }} role="img" aria-label={`Logs ${n} and ${m} against limit ${k}`}>
      {log('n', n, 20)}
      {log('m', m, 62)}
      <line x1={limitX} x2={limitX} y1={10} y2={100} stroke="var(--error)" strokeDasharray="5 4" strokeWidth="2" />
      <text x={limitX} y={114} textAnchor="middle" fontSize="12" fill="var(--text)">k = {k}</text>
    </svg>
    <div aria-label="Trucks" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {[0, 1, 2].map(t => {
        const piece = step.loaded?.[t]
        return <div key={t} data-truck={t} style={{ flex: '1 1 130px', minWidth: 130, border: '2px solid var(--border)', borderRadius: 8, padding: 8, background: 'var(--surface2)' }}>
          <small>Truck {t + 1}</small>
          <div style={{ height: 18, marginTop: 4, border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden', background: 'var(--surface)' }}>
            {piece !== undefined && <div style={{ height: '100%', width: `${Math.max(3, piece / k * 100)}%`, background: 'var(--success)' }} />}
          </div>
          <strong style={{ fontSize: 13 }}>{piece !== undefined ? `${piece} of ${k}` : step.loaded ? 'empty' : 'waiting'}</strong>
        </div>
      })}
    </div>
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <figure style={{ margin: 0 }} aria-label="Cost as an area">
        <figcaption style={{ fontWeight: 700, marginBottom: 6 }}>Cost is the area a × b</figcaption>
        {current
          ? <div style={{ width: current.b * rectScale, height: Math.max(4, current.a * rectScale), background: 'color-mix(in srgb, var(--primary) 26%, var(--surface2))', border: '2px solid var(--text)', display: 'grid', placeItems: 'center', fontSize: 12, minWidth: 90, minHeight: 22 }}>{current.a} × {current.b} = {current.a * current.b}</div>
          : <p style={{ margin: 0, color: 'var(--text-dim)' }}>No cut yet</p>}
      </figure>
      <figure style={{ margin: 0, flex: '1 1 240px' }} aria-label="Cost of each tried cut">
        <figcaption style={{ fontWeight: 700, marginBottom: 6 }}>Cuts tried, from most uneven to most even</figcaption>
        {step.range && <p style={{ margin: '0 0 6px', fontSize: 13 }}>Shorter piece may be {step.range.low} to {step.range.high}.</p>}
        {tried.length === 0 && <p style={{ margin: 0, color: 'var(--text-dim)' }}>None</p>}
        {tried.map(t => {
          const isBest = step.best && step.best.a === t.a
          return <div key={t.a} data-cut={t.a} data-best={isBest || undefined} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 3 }}>
            <span>{t.a} + {t.b}</span>
            <span style={{ height: 12, background: 'var(--surface2)', borderRadius: 3 }}><span style={{ display: 'block', height: '100%', width: `${t.cost / worst * 100}%`, background: isBest ? 'var(--success)' : 'var(--primary)', borderRadius: 3 }} /></span>
            <strong>{t.cost}{isBest ? ' best' : ''}</strong>
          </div>
        })}
      </figure>
    </div>
  </section>
}
