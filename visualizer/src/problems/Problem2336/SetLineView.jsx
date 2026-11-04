import './SetLineView.css'

/**
 * The positive integers as a number line. Numbers below the counter are taken, unless they were added back.
 * Numbers at or above the counter are still in the set.
 */
export default function SetLineView({ step }) {
  const back = new Set(step.back)
  const top = Math.max(step.fresh + 3, ...step.back, 8)
  const size = Math.min(top, 30)
  const cells = Array.from({ length: size }, (_, index) => index + 1)
  const sortedBack = [...step.back].sort((a, b) => a - b)
  return <section className="set-line" aria-label="Positive integers and their state">
    <ol className="set-line__cells" aria-label="Number line">
      {cells.map(n => {
        const state = back.has(n) ? 'back' : n < step.fresh ? 'taken' : 'fresh'
        const marks = [n === step.value ? 'returned' : null, n === step.fresh ? 'counter' : null].filter(Boolean).join(' ')
        return <li key={n} data-state={state} data-marks={marks || undefined} className={`set-line__cell set-line__cell--${state}${n === step.value ? ' set-line__cell--returned' : ''}`}>
          <span>{n}</span>
          {n === step.fresh && <small>next</small>}
        </li>
      })}
    </ol>
    <div className="set-line__heap" aria-label="Added-back min heap">
      <strong>Added back, smallest first</strong>
      <span>{sortedBack.length ? sortedBack.map((n, i) => <b key={n} data-min={i === 0 || undefined}>{n}</b>) : 'empty'}</span>
    </div>
    <ul className="set-line__legend" aria-label="Legend">
      <li><i className="set-line__swatch set-line__swatch--fresh" /> still in the set</li>
      <li><i className="set-line__swatch set-line__swatch--taken" /> taken and not added back</li>
      <li><i className="set-line__swatch set-line__swatch--back" /> added back, waiting in the heap</li>
    </ul>
  </section>
}
