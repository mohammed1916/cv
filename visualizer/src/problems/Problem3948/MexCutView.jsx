import './MexCutView.css'

export default function MexCutView({ run, step }) {
  const values = run.input
  const target = step.target ?? 0
  const inSegment = i => step.p !== undefined && step.e >= 0 && i >= step.p && i <= step.e
  return (
    <section className="mex-cut" aria-label="Mex cut view">
      <div className="mex-cut__row" role="list" aria-label="Array values">
        {values.map((value, i) => {
          const cut = step.phase === 'cut' && i === step.e
          return (
            <div key={i} role="listitem" className={`mex-cut__cell${inSegment(i) ? ' mex-cut__cell--segment' : ''}${i < step.p ? ' mex-cut__cell--done' : ''}${cut ? ' mex-cut__cell--cut' : ''}`}>
              <span className="mex-cut__value">{value}</span>
              <span className="mex-cut__index">{i}</span>
            </div>
          )
        })}
      </div>
      <p className="mex-cut__label">
        {step.phase === 'done' || step.target === null ? 'Between segments' : `Target mex ${target}: the segment must hold 0 to ${target - 1}`}
      </p>
      <ul className="mex-cut__needs" aria-label="Values the segment must hold">
        {Array.from({ length: target }, (_, v) => v).map(v => {
          const have = (step.seen || []).includes(v)
          return <li key={v} className={have ? 'mex-cut__need mex-cut__need--have' : 'mex-cut__need'}>{have ? `${v} seen` : `${v} missing`}</li>
        })}
        {target === 0 && <li className="mex-cut__need mex-cut__need--have">no values needed</li>}
      </ul>
      <div className="mex-cut__answer" aria-label="Answer so far">
        <span>Answer so far:</span>
        {step.answer.length ? step.answer.map((v, i) => <b key={i}>{v}</b>) : <i>empty</i>}
      </div>
    </section>
  )
}
