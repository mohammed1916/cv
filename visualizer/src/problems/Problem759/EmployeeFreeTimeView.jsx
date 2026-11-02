import './EmployeeFreeTimeView.css'

const SPAN = 50
const pct = time => `${(time / SPAN) * 100}%`
const TICKS = [0, 10, 20, 30, 40, 50]

export default function EmployeeFreeTimeView({ run, step }) {
  const schedules = run.input
  const currentItem = step.current >= 0 ? step.items[step.current] : null
  return (
    <figure className="eft" aria-label="Busy intervals for each employee on one time axis">
      <div className="eft__axis" aria-hidden="true">
        {TICKS.map(time => <span key={time} style={{ left: pct(time) }}>{time}</span>)}
      </div>
      <div className="eft__body">
        {schedules.map((busy, owner) => (
          <div className="eft__row" key={owner}>
            <span className="eft__label">Employee {owner}</span>
            <div className="eft__track">
              {busy.map(([start, end]) => {
                const isCurrent = currentItem && currentItem.owner === owner && currentItem.start === start && currentItem.end === end
                const isDone = step.reach !== null && end <= step.reach && !isCurrent
                return (
                  <div key={`${start}-${end}`}
                    className={`eft__busy${isCurrent ? ' eft__busy--current' : ''}${isDone ? ' eft__busy--done' : ''}`}
                    style={{ left: pct(start), width: pct(end - start) }}>
                    [{start},{end}]
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div className="eft__overlay" aria-hidden="true">
          {step.free.map(([start, end]) => (
            <div key={`${start}-${end}`} className="eft__free" style={{ left: pct(start), width: pct(end - start) }}>free</div>
          ))}
          {step.reach !== null && <div className="eft__reach" style={{ left: pct(step.reach) }} />}
        </div>
      </div>
      <figcaption className="eft__status">
        <span>Reach: {step.reach === null ? 'none yet' : step.reach}</span>
        <span>Free gaps: {step.free.length ? step.free.map(([a, b]) => `[${a}, ${b}]`).join(' ') : 'none yet'}</span>
        {currentItem && <span>Next interval: [{currentItem.start}, {currentItem.end}]</span>}
      </figcaption>
    </figure>
  )
}
