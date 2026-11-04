import './TimelineView.css'

// Each timer is a bar from time zero to its delay. Bars are drawn in start order; the fired list
// shows the order in which the timers resolve, with the one just fired highlighted.
export default function TimelineView({ view }) {
  const timers = view.timers || []
  const fired = view.fired || []
  const max = Math.max(1, ...timers.map(t => t.ms))
  const firedOrder = new Map(fired.map((index, position) => [index, position + 1]))
  const current = view.focus >= 0 ? fired[view.focus] : -1
  return <section className="timeline-view" aria-label="Timer timeline">
    <div className="timeline-view__axis"><span>0 ms</span><span>{`${max} ms`}</span></div>
    <ul className="timeline-view__rows" role="list">
      {timers.map(timer => {
        const place = firedOrder.get(timer.index)
        return <li key={timer.index} className={`timeline-view__row${timer.index === current ? ' timeline-view__row--current' : ''}`}>
          <span className="timeline-view__label">{`timer ${timer.index}`}</span>
          <span className="timeline-view__track"><span className={`timeline-view__bar${place ? ' timeline-view__bar--fired' : ''}`} style={{ width: `${(timer.ms / max) * 100}%` }} /></span>
          <span className="timeline-view__time">{`${timer.ms} ms`}</span>
          <span className="timeline-view__place">{place ? `#${place}` : ''}</span>
        </li>
      })}
    </ul>
    <p className="timeline-view__note">{fired.length ? `Completion order so far: ${fired.join(', ')}` : 'All timers start together at time zero.'}</p>
  </section>
}
