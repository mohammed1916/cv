import './ThresholdPickView.css'

// A table of indexes with their threshold and value. Each step shows which indexes are unlocked, which are
// waiting in the eligible pool, which were picked, and the step counter that gates the threshold check.
export default function ThresholdPickView({ run, step }) {
  if (!run || !step) return <section className="tp-view"><p className="tp-empty">Press Play to run the picks step by step.</p></section>
  const { nums, threshold } = run.input
  const n = nums.length
  const pool = new Set(step.available)
  const picked = new Set(step.picked)
  const unlockedNow = new Set(step.unlocked || [])
  const stepLabel = step.step ?? 1
  return (
    <section className="tp-view" aria-label="Threshold picks">
      <div className="tp-step">
        <span className="tp-step-chip">{`step ${stepLabel}`}</span>
        <span className="tp-total">{`total ${step.total}`}</span>
      </div>
      <table className="tp-table">
        <thead>
          <tr><th>index</th><th>nums</th><th>threshold</th><th>state</th></tr>
        </thead>
        <tbody>
          {Array.from({ length: n }, (_, i) => {
            let state = 'locked'
            if (picked.has(i)) state = 'picked'
            else if (pool.has(i)) state = 'eligible'
            const rowClass = ['tp-row', `tp-row--${state}`]
            if (unlockedNow.has(i)) rowClass.push('tp-row--unlocked')
            if (step.chosen === i) rowClass.push('tp-row--chosen')
            return (
              <tr key={i} className={rowClass.join(' ')}>
                <td>{i}</td>
                <td>{nums[i]}</td>
                <td>{`${threshold[i]}${threshold[i] <= stepLabel ? ' (open)' : ''}`}</td>
                <td>{state}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="tp-message">{step.message}</p>
      <p className="tp-key">Rule: an index is eligible once its threshold is at most the step. The largest eligible value is taken, then the step advances. The run stops when nothing is eligible.</p>
    </section>
  )
}
