import './PrefixBarsView.css'

// Bars show the current values; the prefix 0..index is the one an operation shifts.
export default function PrefixBarsView({ run, step }) {
  if (!run || !step) return <section className="pb-view"><p>Press Play to close each gap with a prefix operation.</p></section>

  const values = step.values
  const range = Math.max(4, ...values.map(v => Math.abs(v)))
  const H = 180
  const zeroY = H / 2
  const scale = (H / 2 - 22) / range
  const barW = 44
  const gap = 12
  const W = values.length * (barW + gap) + gap
  const inPrefix = i => step.index >= 0 && i <= step.index && step.phase === 'apply'
  const pair = i => step.index >= 0 && (i === step.index || i === step.index + 1)

  return (
    <section className="pb-view" aria-label="Values as bars with the current prefix">
      <svg viewBox={`0 0 ${W} ${H + 36}`} role="img" aria-label={`Values ${values.join(', ')}`}>
        <line x1={0} x2={W} y1={zeroY} y2={zeroY} className="pb-view__axis" />
        {values.map((v, i) => {
          const h = Math.abs(v) * scale
          const x = gap + i * (barW + gap)
          const y = v >= 0 ? zeroY - h : zeroY
          return (
            <g key={i} className={[
              'pb-view__bar',
              inPrefix(i) ? 'pb-view__bar--prefix' : '',
              pair(i) ? 'pb-view__bar--pair' : '',
            ].join(' ')}>
              <rect x={x} y={y} width={barW} height={Math.max(2, h)} rx={4} />
              <text x={x + barW / 2} y={v >= 0 ? y - 6 : y + h + 14} textAnchor="middle">{v}</text>
              <text x={x + barW / 2} y={H + 16} textAnchor="middle" className="pb-view__index">{i}</text>
            </g>
          )
        })}
      </svg>
      <p className="pb-view__status" aria-live="polite">
        {step.phase === 'apply' ? `Shifted indices 0 to ${step.index} by ${step.delta}.` : step.message}
      </p>
      <dl className="pb-view__stats">
        <div><dt>Operations</dt><dd>{step.ops}</dd></div>
        <div><dt>Gap checked</dt><dd>{step.index >= 0 ? `${step.index} and ${step.index + 1}` : 'none'}</dd></div>
        <div><dt>Answer</dt><dd>{step.result ?? 'pending'}</dd></div>
      </dl>
    </section>
  )
}
