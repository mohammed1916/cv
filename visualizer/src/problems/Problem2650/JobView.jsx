import './JobView.css'

// The job as consecutive step segments on the clock. The dashed line is the cancel time. A step that
// would end after it is shown as pending and never completes.
export default function JobView({ run, step }) {
  const total = Math.max(1, run.input.cancelAt, ...run.input.steps.reduce((acc, d) => { acc.push((acc.at(-1) ?? 0) + d); return acc }, []))
  const pct = ms => `${(ms / total) * 100}%`
  const segments = []
  let start = 0
  run.input.steps.forEach((d, index) => {
    segments.push({ index, from: start, to: start + d })
    start += d
  })
  return <section className="job-view" aria-label="Cancellable job timeline">
    <ol className="job-view__track" role="list">
      {segments.map(seg => {
        const finished = step.done.length > seg.index
        const pending = step.pending?.index === seg.index
        const cls = finished ? 'job-view__seg--done' : pending ? 'job-view__seg--pending' : 'job-view__seg--waiting'
        return <li key={seg.index} className={`job-view__seg ${cls}`} style={{ left: pct(seg.from), width: pct(seg.to - seg.from) }}>
          {`step ${seg.index + 1}`}
        </li>
      })}
      <li className="job-view__cancel" style={{ left: pct(run.input.cancelAt) }} aria-label={`cancel at ${run.input.cancelAt} ms`}>{`cancel ${run.input.cancelAt}`}</li>
    </ol>
    <p className="job-view__state">{`Clock ${step.t} ms · ${step.status}`}</p>
    <p className="job-view__note">{step.status === 'cancelled' ? 'Cancelled: the pending step never completes.' : step.status === 'finished' ? `Finished at ${step.t} ms.` : 'Each step completes in order; the clock advances as they do.'}</p>
  </section>
}
