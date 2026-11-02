import './KeypadView.css'

// Nine keys. Each key lists the letters placed on its first, second and third slot, with the presses.
export default function KeypadView({ run, step }) {
  const keys = Array.from({ length: 9 }, (_, k) => ({ num: k + 1, slots: [] }))
  step.slots.forEach(entry => {
    keys[entry.key - 1].slots.push({ letter: entry.letter, count: entry.count, presses: entry.presses, rank: entry.rank })
  })
  keys.forEach(key => key.slots.sort((a, b) => a.presses - b.presses))
  return (
    <div className="keypad-view">
      <div className="keypad" role="grid" aria-label="Keypad with letters">
        {keys.map(key => {
          const active = step.rank >= 0 && (step.rank % 9) + 1 === key.num
          return <div key={key.num} className={`keypad-key${active ? ' keypad-key--active' : ''}`}>
            <div className="keypad-key__num">{key.num}</div>
            {key.slots.map(slot => (
              <span key={slot.rank} className={`keypad-letter${slot.rank === step.rank ? ' keypad-letter--new' : ''}`}>
                {slot.letter} × {slot.count} = {slot.count * slot.presses} ({slot.presses}p)
              </span>
            ))}
          </div>
        })}
      </div>
      <p className="keypad-caption">{step.letter ? `${step.letter}: slot ${step.rank}, ${step.presses} press${step.presses === 1 ? '' : 'es'} each.` : 'Counting letters.'}</p>
      <p className="keypad-total">Total keypresses so far: {step.total}</p>
    </div>
  )
}
