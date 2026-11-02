const onOff = on => (on ? 'ON' : 'OFF')
const icon = on => (on ? '●' : '○')

// Bulb IDs that appear in the input, sorted ascending, so each ID is one card.
function distinctIds(bulbs) {
  return [...new Set(bulbs)].sort((a, b) => a - b)
}

export default function BulbBoard({ run, step }) {
  const bulbs = run.input.bulbs
  const ids = distinctIds(bulbs)
  const litSet = new Set(step.lit || [])
  const toggling = step.phase === 'toggle'
  const next = step.at + 1 < bulbs.length ? bulbs[step.at + 1] : null
  // Parity so far: number of events for each ID up to and including the cursor.
  const flipsSoFar = id => bulbs.slice(0, step.at + 1).filter(b => b === id).length
  const finished = step.phase === 'done'

  return <div className="bulb-board" style={{ display: 'grid', gap: 12 }}>
    <section aria-label="Bulb states">
      <h3 style={{ margin: '0 0 6px' }}>Bulbs (distinct IDs)</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ids.map(id => {
          const on = litSet.has(id)
          const isCurrent = toggling && id === step.bulb
          const isNext = !toggling && next === id && !finished
          const predictedNext = isNext ? !on : null
          const parity = flipsSoFar(id)
          return <div key={id} data-bulb={id} data-on={on ? 'on' : 'off'}
            aria-label={`Bulb ${id} ${onOff(on)}, flipped ${parity} time${parity === 1 ? '' : 's'}`}
            style={{
              minWidth: 96, padding: 8, borderRadius: 8, textAlign: 'center',
              border: isCurrent ? '3px solid #1d4ed8' : isNext ? '2px dashed #b45309' : '1px solid #94a3b8',
              background: on ? '#fde68a' : '#e2e8f0', color: '#0f172a',
            }}>
            <div style={{ fontSize: 22 }} aria-hidden="true">{icon(on)}</div>
            <strong>Bulb {id}: {onOff(on)}</strong>
            <div style={{ fontSize: 12 }}>
              flips so far: {parity} ({parity % 2 === 1 ? 'odd, on' : 'even, off'})
            </div>
            {isNext && <div style={{ fontSize: 12, color: '#92400e' }}>next: before {onOff(on)} to after {onOff(predictedNext)}</div>}
            {isCurrent && <div style={{ fontSize: 12, color: '#1e3a8a' }}>this step: before {onOff(step.before)} to after {onOff(step.on)}</div>}
          </div>
        })}
      </div>
    </section>

    <section aria-label="Event cursor">
      <h3 style={{ margin: '0 0 6px' }}>Events (cursor at {step.at >= 0 ? step.at + 1 : 0} of {bulbs.length})</h3>
      <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
        {bulbs.map((bulb, i) => {
          const done = i <= step.at
          const cursor = i === step.at
          return <li key={i} aria-current={cursor ? 'step' : undefined} data-event={i}
            style={{
              padding: '4px 8px', borderRadius: 6,
              border: cursor ? '2px solid #1d4ed8' : '1px solid #94a3b8',
              background: done ? '#dbeafe' : 'transparent', color: '#0f172a',
              opacity: done ? 1 : 0.6,
            }}>
            {i + 1}: bulb {bulb}
          </li>
        })}
      </ol>
    </section>

    <output aria-label="Lit bulbs" style={{ display: 'block' }}>
      {finished
        ? `Final lit set (sorted): ${step.lit.length ? step.lit.join(', ') : 'none'}`
        : `Lit so far: ${step.lit && step.lit.length ? step.lit.join(', ') : 'none'}`}
    </output>
  </div>
}
