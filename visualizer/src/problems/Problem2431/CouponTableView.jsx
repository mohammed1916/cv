import './CouponTableView.css'

export default function CouponTableView({ run, step }) {
  if (!run || !step) return null
  const { price, tastiness, maxAmount: M, maxCoupons: C } = run.input
  const { table, prev, item, full, coupon, phase } = step
  const cols = Array.from({ length: M + 1 }, (_, a) => a)
  const rows = Array.from({ length: C + 1 }, (_, c) => c)

  return (
    <div className="coupon-view">
      <ol className="coupon-view__fruits" aria-label="Fruits">
        {price.map((p, i) => {
          const cls = ['coupon-view__fruit', i === item ? 'is-current' : '', i < item ? 'is-done' : ''].join(' ')
          return (
            <li key={i} className={cls}>
              <strong>{`Fruit ${i}`}</strong>
              <span>{`price ${p} · coupon ${Math.floor(p / 2)}`}</span>
              <span>{`tastiness ${tastiness[i]}`}</span>
            </li>
          )
        })}
      </ol>
      <div className="coupon-view__grid" role="table" aria-label="Best tastiness by coupons used and money spent">
        <div className="coupon-view__corner" aria-hidden="true">c \ a</div>
        {cols.map(a => <div key={`h${a}`} className="coupon-view__head" role="columnheader">{a}</div>)}
        {rows.map(c => (
          <div key={`r${c}`} className="coupon-view__row" role="row">
            <div className="coupon-view__head" role="rowheader">{c}</div>
            {cols.map(a => {
              const changed = prev && prev[c][a] !== table[c][a]
              const target = c === C && a === M
              const cls = ['coupon-view__cell', changed ? 'is-changed' : '', target ? 'is-target' : ''].join(' ')
              return <div key={a} role="cell" className={cls}>{table[c][a]}</div>
            })}
          </div>
        ))}
      </div>
      <p className="coupon-view__note" aria-live="polite">
        {phase === 'merge' || phase === 'done'
          ? `Target cell: full price ${full ?? 'not affordable'}, coupon ${coupon ?? 'not available'}, stored ${table[C][M]}.`
          : `Target cell is ${C} coupon${C === 1 ? '' : 's'} with money ${M}.`}
      </p>
    </div>
  )
}
