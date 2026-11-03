import './PrefixLanesView.css'

export default function PrefixLanesView({ run, step }) {
  const { nums } = run.input
  return (
    <div className="pl-view">
      <p className="pl-rule">Values are read in order. Whenever the running sum dips below 0, the smallest value read so far moves to the end.</p>
      <section className="pl-lane" aria-label="Values in order">
        <h3>Read in order</h3>
        <div className="pl-row">
          {nums.map((value, i) => {
            const role = i === step.i ? 'now' : i < step.i ? 'read' : 'ahead'
            return <span key={i} className={`pl-token pl-token--${role}`} data-role={role}>{value}</span>
          })}
        </div>
      </section>
      <section className="pl-lane" aria-label="Heap of values read and kept">
        <h3>Heap (smallest first)</h3>
        <div className="pl-row">
          {step.heap.length === 0 && <span className="pl-empty">empty</span>}
          {step.heap.map((value, slot) => (
            <span key={`${slot}-${value}`} className={`pl-token pl-token--heap${step.popped === value && slot === 0 ? ' pl-token--popped' : ''}`}>{value}</span>
          ))}
        </div>
      </section>
      <section className="pl-lane" aria-label="Values moved to the end">
        <h3>Moved to end ({step.moves})</h3>
        <div className="pl-row">
          {step.moved.length === 0 && <span className="pl-empty">none yet</span>}
          {step.moved.map((value, slot) => <span key={slot} className="pl-token pl-token--moved">{value}</span>)}
        </div>
      </section>
      <output className="pl-sum" aria-label="Running sum">Running sum {step.total}{step.total < 0 ? ' (negative: move one)' : ' (nonnegative)'}</output>
    </div>
  )
}
