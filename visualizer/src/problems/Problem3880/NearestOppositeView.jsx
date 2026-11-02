const CELL = 44
const GAP = 6

// Shows the sequence, last-seen 1 and last-seen 2, the current connection and the retained best pair.
export default function NearestOppositeView({ run, step }) {
  const nums = run.input.nums
  const n = nums.length
  const width = n * (CELL + GAP)
  const center = i => i * (CELL + GAP) + CELL / 2
  const current = step.at >= 0 ? step.at : -1
  const partner = step.partner
  const best = step.bestPair
  const bestText = step.best === null || step.best === undefined ? 'none' : step.best
  const gapText = partner !== undefined && current >= 0 && step.gap !== undefined
    ? `${current} − ${partner} = ${step.gap}`
    : null
  const roleOf = i => {
    if (best && (i === best.from || i === best.to)) return 'best'
    if (i === current) return 'current'
    if (partner !== undefined && i === partner) return 'partner'
    return ''
  }
  const label = i => {
    if (i === current) return 'current'
    if (partner !== undefined && i === partner) return 'partner'
    if (best && (i === best.from || i === best.to)) return 'best pair'
    return nums[i] === 0 ? 'skipped' : ' '
  }
  return <section className="nearest-opposite" aria-label="Nearest opposite value">
    <div className="nearest-opposite__track" style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ position: 'relative', width, minWidth: '100%' }}>
        <svg width={width} height={72} viewBox={`0 0 ${width} 72`} role="img" aria-label={gapText ? `Connection ${gapText}` : 'No connection this frame'} style={{ display: 'block' }}>
          {partner !== undefined && current >= 0 && partner !== current && <>
            <path d={`M ${center(partner)} 60 Q ${(center(partner) + center(current)) / 2} 4 ${center(current)} 60`} fill="none" stroke="var(--accent, #0f766e)" strokeWidth="2" />
            <text x={(center(partner) + center(current)) / 2} y="14" textAnchor="middle" fontSize="12" fill="currentColor">{gapText}</text>
          </>}
        </svg>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${CELL}px)`, gap: GAP }}>
          {nums.map((v, i) => {
            const role = roleOf(i)
            return <div key={i} data-index={i} data-role={role} data-value={v} className={`nearest-opposite__cell ${v === 0 ? 'is-zero' : ''} ${role ? `is-${role}` : ''}`}
              style={{ width: CELL, textAlign: 'center', border: '2px solid currentColor', borderRadius: 6, padding: '4px 0', opacity: v === 0 ? 0.45 : 1, fontWeight: role === 'current' ? 700 : 400, textDecoration: v === 0 ? 'line-through' : 'none', outline: role === 'best' ? '3px dashed currentColor' : 'none' }}>
              <small>[{i}]</small>
              <strong style={{ display: 'block' }}>{v}{v === 0 ? ' (0)' : ''}</strong>
              <span style={{ display: 'block', fontSize: 11 }}>{label(i)}</span>
            </div>
          })}
        </div>
      </div>
    </div>
    <dl className="nearest-opposite__state" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div><dt>last 1</dt><dd>{step.last[1] >= 0 ? `index ${step.last[1]}` : 'none'}</dd></div>
      <div><dt>last 2</dt><dd>{step.last[2] >= 0 ? `index ${step.last[2]}` : 'none'}</dd></div>
      <div><dt>subtraction</dt><dd>{gapText ?? '—'}</dd></div>
      <div><dt>best</dt><dd>{bestText}{best ? ` (indices ${best.from} and ${best.to})` : ''}</dd></div>
    </dl>
    <output aria-label="Smallest gap">{`best = ${bestText}`}{best ? ` · endpoints ${best.from} and ${best.to}` : ''}</output>
  </section>
}
