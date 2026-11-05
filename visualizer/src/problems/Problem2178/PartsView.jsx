// Each part is a bar of its size. The remainder is shown as a dashed block until it is absorbed by the last part.
export default function PartsView({ run, step }) {
  const total = run.input.finalSum
  const parts = step.parts ?? []
  const remaining = step.remaining ?? 0
  const scale = Math.max(1, total)
  return (
    <div className="parts-view">
      <p>Total: <strong>{total}</strong> · used so far: <strong>{parts.reduce((a, b) => a + b, 0)}</strong> · left: <strong>{total - parts.reduce((a, b) => a + b, 0)}</strong></p>
      <div className="parts-row" role="img" aria-label={`Parts ${parts.join(', ')}`}>
        {parts.map((value, i) => <div key={i} className={`part-bar${i === parts.length - 1 ? ' is-last' : ''}`} style={{ width: `${(value / scale) * 100}%` }}>
          <span>{value}</span>
        </div>)}
        {remaining > 0 && step.phase !== 'done' && <div className="part-rest" style={{ width: `${(remaining / scale) * 100}%` }}><span>{remaining} left</span></div>}
      </div>
      {step.next !== undefined && <p>Next even part to try: {step.next}.</p>}
    </div>
  )
}
