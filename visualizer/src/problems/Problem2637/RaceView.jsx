import './RaceView.css'

// The task and the limit timer run side by side from time zero. Each bar grows with the clock; whichever
// reaches its end first decides the outcome.
export default function RaceView({ frame }) {
  const span = Math.max(1, frame.delay, frame.limit)
  const t = Math.min(frame.t ?? 0, span)
  const pct = ms => `${(ms / span) * 100}%`
  const taskDone = frame.outcome === 'resolved'
  const limitDone = frame.outcome === 'rejected'
  return <section className="race-view" aria-label="Time limit race">
    <div className="race-view__row">
      <span className="race-view__label">Task</span>
      <span className="race-view__track"><span className={`race-view__bar${frame.outcome === 'resolved' ? ' race-view__bar--win' : ''}`} style={{ width: pct(frame.outcome === 'resolved' ? frame.delay : t) }} /></span>
      <span className="race-view__time">{`${frame.delay} ms`}</span>
    </div>
    <div className="race-view__row">
      <span className="race-view__label">Limit</span>
      <span className="race-view__track"><span className={`race-view__bar race-view__bar--timer${limitDone ? ' race-view__bar--win' : ''}`} style={{ width: pct(limitDone ? frame.limit : t) }} /></span>
      <span className="race-view__time">{`${frame.limit} ms`}</span>
    </div>
    <p className="race-view__note">{taskDone ? 'The task settled first.' : limitDone ? 'The timer settled first.' : `Clock at ${t} ms; neither has settled.`}</p>
  </section>
}
