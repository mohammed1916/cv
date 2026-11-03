import './ArrangementView.css'

export default function ArrangementView({ run, step }) {
  const sorted = run.input.perm.length
  return (
    <section className="arrangement" aria-label="Arrangement search">
      <p className="arrangement__ops">Operations: reverse the whole array, or rotate it left by one. Each costs one.</p>
      <ol className="arrangement__row" aria-label="Current arrangement">
        {step.arr.map((v, i) => (
          <li key={i} className={`arrangement__cell${step.found ? ' is-goal' : ''}`}>
            <span>{i}</span>
            <strong>{v}</strong>
          </li>
        ))}
      </ol>
      <p role="status">{step.message}</p>
      <dl className="arrangement__facts">
        <div><dt>Operations used</dt><dd>{step.depth < 0 ? '-' : step.depth}</dd></div>
        <div><dt>Waiting in queue</dt><dd>{step.queued}</dd></div>
        <div><dt>Arrangements seen</dt><dd>{step.seen}</dd></div>
        <div><dt>Target</dt><dd>0 to {sorted - 1} in order</dd></div>
      </dl>
    </section>
  )
}
