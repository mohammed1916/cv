// Input values in a row. Kept values fill the lower row as pairs: the first of each pair is the left slot.
export default function KeptView({ run, step }) {
  const { nums } = run.input
  const kept = step.kept ?? []
  return (
    <div className="kept-view">
      <div className="kept-input" role="img" aria-label={`Input ${nums.join(', ')}`}>
        {nums.map((x, i) => <div key={i} className={`kept-cell${i === step.index ? ' is-current' : ''}${i < step.index ? ' is-seen' : ''}`}><small>{i}</small><strong>{x}</strong></div>)}
      </div>
      <div className="kept-row" aria-label="Kept values in order">
        {kept.map((x, i) => <div key={i} className={`kept-slot${i % 2 === 0 ? ' is-left' : ' is-right'}`}><small>{i % 2 === 0 ? 'pair start' : 'pair end'}</small><strong>{x}</strong></div>)}
        {kept.length === 0 && <em>nothing kept yet</em>}
      </div>
      <p>Deleted so far: <strong>{step.deleted}</strong></p>
      {step.dropped !== undefined && <p>The last kept value {step.dropped} is removed to keep the length even.</p>}
    </div>
  )
}
