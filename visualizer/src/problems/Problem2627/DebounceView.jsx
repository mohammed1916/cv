import './DebounceView.css'

// Calls as ticks on a time axis. Each call shows its wait window; a call is skipped when a later call
// lands inside that window, and a run is scheduled at the end of a window that nothing interrupts.
export default function DebounceView({ view }) {
  const calls = view.calls
  const wait = view.wait
  const end = Math.max(1, ...calls.map(t => t + wait))
  const pct = t => `${(t / end) * 100}%`
  const current = view.focus
  return <section className="debounce-view" aria-label="Debounce timeline">
    <div className="debounce-view__axis" aria-hidden="true"><span>0 ms</span><span>{`${end} ms`}</span></div>
    <ol className="debounce-view__rows" role="list">
      {calls.map((t, index) => {
        const outcome = view.outcomes[index]
        const isCurrent = index === current
        return <li key={index} className={`debounce-view__row${isCurrent ? ' debounce-view__row--current' : ''}`}>
          <span className="debounce-view__label">{`call at ${t}`}</span>
          <span className="debounce-view__track">
            <span className="debounce-view__window" style={{ left: pct(t), width: pct(wait) }} />
            <span className={`debounce-view__tick${outcome === 'skip' ? ' debounce-view__tick--skip' : ''}`} style={{ left: pct(t) }} />
            {outcome === 'run' && <span className="debounce-view__run" style={{ left: pct(t + wait) }} title={`run at ${t + wait}`} />}
          </span>
          <span className="debounce-view__verdict">{outcome === 'skip' ? 'skipped' : outcome === 'run' ? `runs at ${t + wait}` : ''}</span>
        </li>
      })}
    </ol>
    <p className="debounce-view__note">{view.runs.length ? `Runs so far: ${view.runs.join(', ')} ms` : 'No run has been scheduled yet.'}</p>
  </section>
}
