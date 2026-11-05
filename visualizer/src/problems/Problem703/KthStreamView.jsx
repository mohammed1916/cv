import './KthStreamView.css'

// Stream strip: each added score is kept (teal) or ignored (grey); the kept set is shown smallest first with the kth largest marked.
export default function KthStreamView({ run, step }) {
  const { k, adds } = run.input
  const shown = step.op === null || step.op === undefined ? -1 : step.op
  return (
    <figure className="kth-view">
      <div className="kth-row" aria-label="Incoming values">
        <span className="kth-label">Stream</span>
        {adds.map((value, i) => {
          const cls = i > shown ? 'kth-chip' : i === shown ? (step.kept ? 'kth-chip kth-chip--kept kth-chip--now' : 'kth-chip kth-chip--ignored kth-chip--now') : (run.frames[i + 1]?.kept ? 'kth-chip kth-chip--kept' : 'kth-chip kth-chip--ignored')
          return <span key={`a-${i}`} className={cls}>{value}</span>
        })}
      </div>
      <div className="kth-row" aria-label="Kept values">
        <span className="kth-label">Top {k}</span>
        {step.top.length ? step.top.map((value, i) => (
          <span key={`t-${i}`} className={i === 0 ? 'kth-chip kth-chip--kth' : 'kth-chip kth-chip--kept'}>{value}{i === 0 ? ' kth' : ''}</span>
        )) : <em>empty</em>}
        {step.evicted !== null && step.evicted !== undefined && <span className="kth-chip kth-chip--dropped">{step.evicted} out</span>}
      </div>
      <figcaption>Kept values sit in ascending order. The first one is the kth largest, so a new value only matters if it beats it.</figcaption>
    </figure>
  )
}
