// Sorted bags as columns. For the target x, bars above x are trimmed to x (the kept part is solid).
export default function BagsView({ run, step }) {
  const { sorted, n } = step
  const max = Math.max(1, ...sorted)
  const x = step.x ?? null
  return (
    <div className="bags-view">
      <div className="bags-columns" role="img" aria-label={`Sorted bags ${sorted.join(', ')}`}>
        {sorted.map((value, i) => {
          const kept = x === null ? 0 : Math.min(value, x)
          const removed = value - kept
          const emptied = x !== null && value < x
          return <div key={i} className={`bag-col${i === step.index ? ' is-current' : ''}`}>
            <span>{value}</span>
            <div className="bag-stack" style={{ height: `${(value / max) * 140}px` }}>
              {removed > 0 && <div className="bag-removed" style={{ flex: removed }} title="removed" />}
              <div className="bag-kept" style={{ flex: kept || 0.0001, background: emptied ? 'var(--surface2)' : 'var(--primary)' }} />
            </div>
            <small>bag {i}</small>
          </div>
        })}
      </div>
      {x !== null && <p>Target <strong>{x}</strong>: {step.keep} bags keep {x} beans. Removal {step.total} - {step.keep * x} = {step.cost}.</p>}
      <p>Total beans: {step.total}. Best removal so far: {Number.isFinite(step.best) ? step.best : '-'}.</p>
      <p>Bags: {n}</p>
    </div>
  )
}
