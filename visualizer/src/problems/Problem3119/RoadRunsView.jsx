import './RoadRunsView.css'

export default function RoadRunsView({ run, step }) {
  const { road, budget } = run.input
  const current = step.run
  const repairedAt = new Set()
  if (current && current.taken > 0) for (let i = 0; i < current.taken; i++) repairedAt.add(current.start + i)
  const lengths = step.order
  return (
    <div className="rrv">
      <ol className="rrv__road" aria-label="Road cells">
        {[...road].map((ch, i) => {
          const inRun = current && i >= current.start && i < current.start + current.length
          const fixed = repairedAt.has(i)
          const kind = ch === 'x' ? 'pothole' : 'intact'
          return (
            <li key={i} className={`rrv__cell rrv__cell--${kind}${inRun ? ' is-run' : ''}${fixed ? ' is-fixed' : ''}`}>
              <span className="rrv__glyph">{ch === 'x' ? 'x' : '.'}</span>
              <span className="rrv__pos">{i}</span>
            </li>
          )
        })}
      </ol>
      <div className="rrv__runs" aria-label="Runs in ascending length">
        <span className="rrv__label">Runs by length</span>
        {lengths.length === 0 ? <span>none</span> : lengths.map((len, i) => (
          <span key={i} className="rrv__chip">{len} costs {len + 1}</span>
        ))}
      </div>
      <div className="rrv__budget">
        <span className="rrv__label">Budget left</span>
        <strong>{step.left}</strong>
        <span className="rrv__label">of {budget}</span>
        <strong className="rrv__total">Fixed: {step.repaired}</strong>
      </div>
      <p className="rrv__note" role="status">{step.message}</p>
    </div>
  )
}
