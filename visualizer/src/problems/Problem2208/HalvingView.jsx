// Bars are the current values, largest first. The halved value is outlined; the removed total is compared with half the sum.
export default function HalvingView({ run, step }) {
  const max = Math.max(1, ...step.heap)
  const target = step.need
  const pct = Math.min(100, (step.removed / Math.max(target, 1e-9)) * 100)
  return (
    <div className="halving-view">
      <div className="halving-bars" role="img" aria-label={`Current values ${step.heap.join(', ')}`}>
        {step.heap.map((v, i) => <div key={i} className={`halving-bar${i === 0 ? ' is-top' : ''}`} style={{ height: `${(v / max) * 130}px` }}><span>{v}</span></div>)}
      </div>
      <p>Heap top (largest) is first. Sum {step.total}; removed {step.removed} of at least {step.need}.</p>
      <div className="halving-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <div style={{ width: `${pct}%`, background: 'var(--primary)', height: '100%' }} />
      </div>
      <p>Operations: <strong>{step.ops}</strong></p>
    </div>
  )
}
