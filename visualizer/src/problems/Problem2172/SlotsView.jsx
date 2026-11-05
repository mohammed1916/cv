import RecordStateTable from '../../components/shared/RecordStateTable'

// Each slot is drawn as two units. The current mask marks the units already filled.
export default function SlotsView({ run, step }) {
  const { nums, slots } = run.input
  const m = slots * 2
  const mask = step.mask >= 0 ? step.mask : 0
  const rows = []
  for (let k = 0; k < step.f.length; k++) {
    if (step.mask >= 0 && k > step.mask) break
    const cnt = k.toString(2).split('').filter(c => c === '1').length
    if (cnt > nums.length) continue
    rows.push({ mask: k.toString(2).padStart(m, '0'), placed: cnt, f: step.f[k] })
  }
  return (
    <div className="slots-view">
      <div className="slot-grid" role="img" aria-label={`${slots} slots, ${m} units`}>
        {Array.from({ length: slots }, (_, s) => <div key={s} className="slot">
          <small>slot {s + 1}</small>
          {[0, 1].map(u => {
            const j = s * 2 + u
            const filled = ((mask >> j) & 1) === 1
            return <div key={j} className={`unit${filled ? ' is-filled' : ''}${step.via === j ? ' is-current' : ''}`}>
              {filled ? 'used' : 'free'}
            </div>
          })}
        </div>)}
      </div>
      <p>Numbers: {nums.join(', ')}. {step.cnt !== undefined ? `Placed in this mask so far: ${step.placed.join(', ')}.` : ''}</p>
      <RecordStateTable label="Masks computed" columns={['mask', 'placed', 'f']} rows={rows} activeRow={rows.length - 1} />
      <p>Best total: {step.best}</p>
    </div>
  )
}
