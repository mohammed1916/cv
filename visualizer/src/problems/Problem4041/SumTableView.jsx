import './SumTableView.css'

// The elements as chips, then the sums 0..target with the fewest operations found so far.
export default function SumTableView({ run, step }) {
  const { nums, target } = run.input
  const sums = Array.from({ length: target + 1 }, (_, s) => s)

  return (
    <section className="sst" aria-label="Minimum operations to form a subset sum">
      <div className="sst-elements" role="list" aria-label="Elements">
        {nums.map((x, i) => (
          <span
            key={i}
            role="listitem"
            className={`sst-element${i === step.index ? ' sst-element--now' : i < step.index ? ' sst-element--done' : ''}`}
          >
            {x}
          </span>
        ))}
      </div>

      <div className="sst-row" role="list" aria-label="Fewest operations for each sum">
        {sums.map(s => {
          const value = step.dp[s]
          const isS = step.s === s
          const isSum = step.v !== undefined && step.s + step.v === s
          const cls = ['sst-cell', value === null ? 'sst-cell--unknown' : '', isS ? 'sst-cell--from' : '', isSum ? 'sst-cell--to' : ''].join(' ')
          return (
            <div key={s} role="listitem" className={cls}>
              <span className="sst-sum">{s}</span>
              <span className="sst-ops">{value === null ? '-' : value}</span>
            </div>
          )
        })}
      </div>

      {step.reach.length > 0 ? (
        <p className="sst-line">
          Element {step.element} reaches: {step.reach.map(([v, c]) => `${v} for ${c}`).join(', ')}
        </p>
      ) : null}
      <p className="sst-key">Each cell is the fewest operations to form that sum. Dashes mean not formed yet.</p>
    </section>
  )
}
