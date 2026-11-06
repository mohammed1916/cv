import './RunsView.css'

const HUES = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--error)', 'var(--info)', 'var(--primary)', 'var(--success)', 'var(--error)']

export default function RunsView({ run, step }) {
  if (!run || !step) return <p className="rv-empty">Press Play to split the string into runs.</p>
  const text = run.input.s
  const cellRun = i => step.runs.findIndex(r => i >= r.start && i < r.start + r.length)
  return (
    <section className="rv" aria-label="Maximal runs and their lengths">
      <div className="rv-tape" role="img" aria-label={`String ${text}`}>
        {[...text].map((ch, i) => {
          const idx = cellRun(i)
          const current = idx >= 0 && idx === step.current
          return (
            <span key={i} className={`rv-cell${current ? ' rv-cell--current' : ''}`}
              style={idx >= 0 ? { '--hue': HUES[idx % HUES.length] } : undefined}>{ch}</span>
          )
        })}
      </div>
      <div className="rv-runs">
        {step.runs.map((r, i) => (
          <span key={r.start} className={`rv-chip${i === step.current ? ' rv-chip--current' : ''}`} style={{ '--hue': HUES[i % HUES.length] }}>
            {r.ch} x{r.length}
          </span>
        ))}
        {step.runs.length === 0 ? <span className="rv-muted">No runs yet</span> : null}
      </div>
      <table className="rv-tally">
        <caption>Runs per length</caption>
        <tbody>
          {step.tally.length === 0 ? <tr><td className="rv-muted">Empty tally</td></tr> : step.tally.map(([len, count]) => (
            <tr key={len} className={count === step.best && step.best > 0 ? 'rv-best' : ''}>
              <th scope="row">length {len}</th>
              <td><span className="rv-bar" style={{ width: `${count * 36}px` }} /></td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <output className="rv-best-badge">Best so far: {step.best}</output>
    </section>
  )
}
