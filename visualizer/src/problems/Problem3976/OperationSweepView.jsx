import './OperationSweepView.css'

export default function OperationSweepView({ run, step }) {
  const { nums } = run.input
  const plan = step.bestPlan
  const inPlan = i => plan && plan.op !== 'none' && i >= plan.l && i <= plan.r
  const inCurrent = i => step.phase === 'sweep' && i >= step.leftIdx && i <= step.r
  return (
    <section className="op-sweep" aria-label="Operation sweep">
      <div className="op-sweep__row" role="list" aria-label="Original values">
        {nums.map((v, i) => (
          <div key={i} role="listitem" className={`op-sweep__cell${inCurrent(i) ? ' op-sweep__cell--current' : ''}${inPlan(i) ? ' op-sweep__cell--best' : ''}`}>
            <span>{v}</span>
            {step.g && <small>{`→ ${step.g[i]}`}</small>}
            <i>{i}</i>
          </div>
        ))}
      </div>
      <p className="op-sweep__op">{step.op ? `Operation: ${step.op} by k` : 'Operation not chosen yet'}</p>
      <dl className="op-sweep__state">
        <dt>Modified interval</dt><dd>{step.phase === 'sweep' ? `${step.leftIdx} to ${step.r}` : '-'}</dd>
        <dt>Left and right extension</dt><dd>{step.phase === 'sweep' ? `${step.leftExt} and ${step.rightExt}` : '-'}</dd>
        <dt>Best so far</dt><dd>{step.best ?? '-'}</dd>
      </dl>
      <p className="op-sweep__message">{step.message}</p>
    </section>
  )
}
