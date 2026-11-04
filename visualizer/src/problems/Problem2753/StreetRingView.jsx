const SIZE = 340
const MID = SIZE / 2
const RING = 118
const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, var(--surface2))`

// The ring of doors with the walker, the anchor and the lap walked so far, above a tape of what each counted step saw.
export default function StreetRingView({ run, step: frame }) {
  const n = run.input.street.length
  const { k } = run.input
  const { doors, pos, anchor, step, answer, tape } = frame
  const angle = i => (2 * Math.PI * i) / n - Math.PI / 2
  const at = (i, radius) => ({ x: MID + radius * Math.cos(angle(i)), y: MID + radius * Math.sin(angle(i)) })
  const house = Math.min(40, Math.max(18, (2 * Math.PI * RING) / n - 8))
  const walker = at(pos, RING - house / 2 - 16)
  const walked = anchor >= 0 ? Math.min(step, n) : 0
  const lapEnd = anchor >= 0 ? at(anchor + walked, RING) : null
  const lapStart = anchor >= 0 ? at(anchor, RING) : null
  const lapPath = !walked ? null
    : walked === n ? <circle cx={MID} cy={MID} r={RING} fill="none" stroke="var(--primary)" strokeWidth="5" opacity="0.55" />
      : <path d={`M ${lapStart.x} ${lapStart.y} A ${RING} ${RING} 0 ${walked / n > 0.5 ? 1 : 0} 1 ${lapEnd.x} ${lapEnd.y}`} fill="none" stroke="var(--primary)" strokeWidth="5" opacity="0.55" />
  return <section aria-label="Circular street" style={{ color: 'var(--text)' }}>
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${n} houses in a ring; the walker is at house ${pos + 1}`} style={{ display: 'block', width: '100%', maxWidth: SIZE, margin: '0 auto' }}>
      <circle cx={MID} cy={MID} r={RING} fill="none" stroke="var(--border)" strokeWidth="3" />
      {lapPath}
      {doors.map((door, i) => {
        const { x, y } = at(i, RING)
        const here = i === pos
        return <g key={i} data-house={i} data-door={door ? 'open' : 'closed'}>
          <rect x={x - house / 2} y={y - house / 2} width={house} height={house} rx="5"
            fill={door ? tint('var(--success)', 45) : 'var(--surface2)'} stroke={here ? 'var(--primary)' : 'var(--border)'} strokeWidth={here ? 3 : 1.5} />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">{house < 30 ? (door ? 'O' : '×') : (door ? 'open' : 'shut')}</text>
          {i === anchor && <text x={x} y={y - house / 2 - 3} textAnchor="middle" fontSize="11" fill="var(--text)">anchor</text>}
        </g>
      })}
      <circle cx={walker.x} cy={walker.y} r="11" fill="var(--primary)" />
      <text x={walker.x} y={walker.y + 26 > MID + 40 ? walker.y - 16 : walker.y + 24} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">walker</text>
      <text x={MID} y={MID - 6} textAnchor="middle" fontSize="13" fill="var(--text)">{anchor < 0 ? 'seeking open door' : `step ${step} of ${k}`}</text>
      <text x={MID} y={MID + 16} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)">{`answer ${answer}`}</text>
    </svg>
    <h3 style={{ margin: '12px 0 4px', fontSize: '0.95rem' }}>What each counted step found</h3>
    <div aria-label="Step tape" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {tape.map((seen, i) => {
        const last = seen === 'open' && i + 1 === answer
        const pastLap = i + 1 > n
        return <div key={i} data-step={i + 1} data-seen={seen ?? 'pending'} style={{
          width: 40, textAlign: 'center', padding: '3px 0', borderRadius: 6, color: 'var(--text)', fontSize: 12,
          border: `2px ${pastLap ? 'dashed' : 'solid'} ${i + 1 === step ? 'var(--primary)' : 'var(--border)'}`,
          background: seen === 'open' ? tint('var(--success)', last ? 60 : 30) : 'var(--surface2)',
          opacity: seen ? 1 : 0.55,
        }}>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>{i + 1}</small>
          <strong>{seen === 'open' ? 'open' : seen === 'closed' ? 'shut' : '–'}</strong>
        </div>
      })}
    </div>
    <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>The coloured arc is the part of one lap walked since the anchor. Dashed steps lie beyond one lap: the ring is already fully shut by then, so they only ever read closed doors.</p>
    <output aria-label="Answer so far" style={{ display: 'block', marginTop: 6, fontWeight: 700, color: 'var(--text)' }}>{`answer = ${answer}`}{answer > 0 ? `, set on step ${answer}` : ''}</output>
  </section>
}
