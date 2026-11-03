import './SwapWindowView.css'

export default function SwapWindowView({ run, step }) {
  const { nums } = run.input
  const inWindow = i => step.l >= 0 && i >= step.l && i <= step.r
  const swappedIn = new Set(step.pairs.map(([low]) => low))
  return (
    <section className="swap-window" aria-label="Swap window">
      <div className="swap-window__cells" role="list" aria-label="Array values">
        {nums.map((v, i) => {
          const inside = inWindow(i)
          return <div key={i} role="listitem" className={`swap-window__cell${inside ? ' swap-window__cell--inside' : ''}${inside && swappedIn.has(v) ? ' swap-window__cell--swapped' : ''}`}>
            <span>{v}</span><small>{i}</small>
          </div>
        })}
      </div>
      <p className="swap-window__pairs">
        {step.pairs.length ? step.pairs.map(([low, high], i) => <span key={i} className="swap-window__pair">{`swap ${low} out for ${high} in`}</span>) : 'No swaps applied in this window.'}
      </p>
      <dl className="swap-window__totals">
        <dt>Window sum before swaps</dt><dd>{step.base ?? '-'}</dd>
        <dt>Window sum after swaps</dt><dd>{step.total ?? '-'}</dd>
        <dt>Best so far</dt><dd>{step.best ?? '-'}{step.bestWindow ? ` (window ${step.bestWindow[0]} to ${step.bestWindow[1]})` : ''}</dd>
      </dl>
      <p className="swap-window__message">{step.message}</p>
    </section>
  )
}
