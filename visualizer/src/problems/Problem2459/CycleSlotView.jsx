import './CycleSlotView.css'

const NAMES = ['Zero first', 'Zero last']

export default function CycleSlotView({ run, step }) {
  if (!run || !step) return null
  const nums = run.input
  const { target, slots, cycle, hasZero, cycleCost, totals, best, phase } = step
  const inCycle = i => cycle.includes(i)

  return (
    <div className="slot-view">
      <div className="slot-view__row" role="list" aria-label="Array positions">
        {nums.map((value, i) => {
          const cls = ['slot-view__cell', value === 0 ? 'is-zero' : '', inCycle(i) ? 'is-in-cycle' : ''].join(' ')
          return (
            <div key={i} role="listitem" className={cls}>
              <span className="slot-view__index">{`pos ${i}`}</span>
              <strong>{value === 0 ? '0 (empty)' : value}</strong>
              {target >= 0 && slots && <span className="slot-view__slot">{`→ slot ${slots[i]}`}</span>}
            </div>
          )
        })}
      </div>
      {target >= 0 && <p className="slot-view__target">{`Target: ${NAMES[target]}`}</p>}
      {cycle.length > 0 && phase === 'cycle' && (
        <p className="slot-view__cycle">{`Cycle ${cycle.join(' → ')}: ${hasZero ? 'contains the empty slot, cost length minus one' : 'no empty slot, cost length plus one'} = ${cycleCost}`}</p>
      )}
      <ul className="slot-view__totals" aria-label="Cost per arrangement">
        {NAMES.map((name, t) => (
          <li key={t} className={target === t ? 'is-active' : ''}>
            {`${name}: ${totals[t] === null || totals[t] === undefined ? 'not yet' : totals[t]}`}
          </li>
        ))}
      </ul>
      <output aria-label="Best so far">{`Best so far: ${best === null || best === undefined ? 'none' : best}`}</output>
    </div>
  )
}
