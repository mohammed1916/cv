import './SplitView.css'

// Shows the array with one optional removed element, the split under test, and the gcd on each side.
export default function SplitView({ run, step }) {
  const nums = run.input
  const remaining = new Set(step.b.map(v => v))
  const removedIndex = step.removed
  const splitAfter = step.split

  return (
    <section className="spl" aria-label="Maximum valid split positions">
      <div className="spl-row" role="list" aria-label="Array values">
        {nums.map((value, i) => {
          const dropped = removedIndex >= 0 && i === removedIndex
          const cls = [
            'spl-cell',
            dropped ? 'spl-cell--dropped' : '',
            removedIndex === -1 || removedIndex === -2 || !dropped ? '' : '',
          ].join(' ')
          return (
            <div key={i} role="listitem" className={cls}>
              <span className="spl-index">{i}</span>
              <span className="spl-value">{value}</span>
              <span className="spl-state">{dropped ? 'removed' : remaining.has(value) ? 'kept' : ''}</span>
            </div>
          )
        })}
      </div>

      <div className="spl-info">
        <p>
          {step.removed === -2
            ? 'No choice yet.'
            : step.removed === -1
              ? 'Choice: keep every element.'
              : `Choice: remove index ${step.removed}.`}
        </p>
        {splitAfter >= 1 ? (
          <p className={step.ok ? 'spl-yes' : 'spl-no'}>
            Split after {splitAfter}: left gcd {step.leftG}, right gcd {step.rightG} ({step.ok ? 'equal' : 'not equal'})
          </p>
        ) : null}
        <p>Count for this choice: {step.count}</p>
        <p className="spl-best">Best score so far: {step.best}{step.bestChoice !== null && step.bestChoice !== undefined ? ` (choice ${step.bestChoice === -1 ? 'keep all' : `remove ${step.bestChoice}`})` : ''}</p>
      </div>
      {step.b.length > 0 ? (
        <p className="spl-note">Remaining array: [{step.b.join(', ')}]; the split marks sit between neighbours.</p>
      ) : null}
    </section>
  )
}
