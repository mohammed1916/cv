import './WindowFlipView.css'

export default function WindowFlipView({ run, step }) {
  if (!run || !step) return null
  const { s, k, windows } = run.input
  const { pivot, count, value, phase } = step
  const cells = [...s]

  return (
    <div className="flip-view">
      <div className="flip-view__string" role="list" aria-label="Binary string" style={{ gridTemplateColumns: `repeat(${s.length}, minmax(0, 1fr))` }}>
        {cells.map((bit, i) => {
          const inWindow = pivot >= 0 && i >= pivot && i < pivot + k
          const cls = ['flip-view__bit', inWindow ? 'is-in-window' : '', i === pivot ? 'is-pivot' : ''].join(' ')
          return <div key={i} role="listitem" className={cls}><span className="flip-view__index">{i}</span><strong>{bit}</strong></div>
        })}
      </div>
      <div className="flip-view__windows" aria-label="Window starts" style={{ gridTemplateColumns: `repeat(${s.length}, minmax(0, 1fr))` }}>
        {Array.from({ length: windows }, (_, i) => (
          <div key={i} className={['flip-view__window', i < count ? 'is-counted' : '', i === pivot ? 'is-pivot' : ''].join(' ')}
            style={{ gridColumn: `${i + 1} / ${i + k + 1}` }}>
            {`W${i}`}
          </div>
        ))}
      </div>
      <p className="flip-view__note" aria-live="polite">
        {phase === 'done'
          ? `${windows} independent windows, so 2^${windows} = ${value} distinct strings (mod 1000000007).`
          : `Windows counted: ${count} of ${windows}. Each one doubles the reachable set.`}
      </p>
      <output aria-label="Reachable count">{`Reachable count: ${value}`}</output>
    </div>
  )
}
