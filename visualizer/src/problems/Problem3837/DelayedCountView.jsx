import './DelayedCountView.css'

export default function DelayedCountView({ run, step }) {
  if (!run || !step) return <p className="dc-empty">Press Play to sweep the array from the right.</p>
  const { nums, k } = run.input
  const [lo, hi] = step.window ?? [null, null]
  const inRegion = i => lo !== null && i >= lo && i <= hi
  return (
    <section className="dc" aria-label="Array with the delayed region">
      <p className="dc-rule">Count indices j with j greater than i plus {k}, where nums[j] equals nums[i].</p>
      <div className="dc-row" role="list" aria-label="Array values">
        {nums.map((v, j) => (
          <div key={j} role="listitem" className={`dc-cell${inRegion(j) ? ' dc-cell--region' : ''}${j === step.added ? ' dc-cell--added' : ''}${j === step.i ? ' dc-cell--i' : ''}`}>
            <span className="dc-value">{v}</span>
            <span className="dc-index">{j}</span>
          </div>
        ))}
      </div>
      <p className="dc-current">
        {step.i === null ? 'Sweep finished.' : `i = ${step.i}, value ${nums[step.i]}, delayed region starts at ${step.i + k + 1}.`}
      </p>
      <div className="dc-tally" aria-label="Values currently in the delayed region">
        {step.counts.length ? step.counts.map(([v, c]) => (
          <span key={v} className={`dc-chip${step.i !== null && v === nums[step.i] ? ' dc-chip--match' : ''}`}>{v}: {c}</span>
        )) : <span className="dc-muted">Region is empty</span>}
      </div>
      <p className="dc-result">Counts so far: [{step.result.join(', ')}]</p>
      <p className="dc-message">{step.message}</p>
    </section>
  )
}
