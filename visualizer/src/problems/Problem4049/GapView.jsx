import './GapView.css'

// Shows the array with the value under inspection, its index list, and the gap chips between neighbours.
export default function GapView({ run, step }) {
  const nums = run.input
  const current = step.value
  const currentIdx = step.positions.find(([value]) => value === current)?.[1] ?? []

  return (
    <section className="gap" aria-label="Constant gap occurrences">
      <div className="gap-row" role="list" aria-label="Array values">
        {nums.map((value, i) => {
          const hot = currentIdx.includes(i)
          return (
            <div key={i} role="listitem" className={`gap-cell${hot ? ' gap-cell--hot' : ''}${i === step.at ? ' gap-cell--now' : ''}`}>
              <span className="gap-index">{i}</span>
              <span className="gap-value">{value}</span>
            </div>
          )
        })}
      </div>

      {current !== null && currentIdx.length > 0 ? (
        <div className="gap-chain" aria-label="Gaps between neighbouring occurrences">
          <strong>Value {current}:</strong>
          {currentIdx.map((p, t) => (
            <span key={p} className="gap-chip">
              index {p}
              {t < currentIdx.length - 1 ? ` → +${currentIdx[t + 1] - p}` : ''}
            </span>
          ))}
          <span className={`gap-verdict gap-verdict--${step.verdict === 'counted' ? 'yes' : step.verdict === 'gaps differ' ? 'no' : 'idle'}`}>
            {step.verdict === 'counted' ? 'constant gaps: counted' : step.verdict === 'gaps differ' ? 'gaps differ: not counted' : step.verdict === 'skip' ? 'fewer than three: skipped' : 'checking'}
          </span>
        </div>
      ) : (
        <p className="gap-muted">Pick out the values one at a time as the trace runs.</p>
      )}

      <output className="gap-count" aria-label="Count so far">Count so far: {step.count}</output>
    </section>
  )
}
