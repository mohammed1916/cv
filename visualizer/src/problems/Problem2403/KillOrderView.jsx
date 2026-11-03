import './KillOrderView.css'

const bits = (mask, n) => mask.toString(2).padStart(n, '0')

export default function KillOrderView({ run, step }) {
  if (!run || !step) return null
  const power = run.input
  const n = power.length
  const { best, mask, candidate, picked, factor, days, order, phase } = step
  const killedSet = mask >= 0 ? mask : 0
  const rows = Array.from({ length: 1 << n }, (_, m) => m)

  return (
    <div className="kill-view">
      <div className="kill-view__monsters" role="list" aria-label="Monsters">
        {power.map((p, j) => {
          const killed = (killedSet >> j) & 1
          const current = picked === j
          const cls = ['kill-view__monster', killed ? 'is-killed' : '', current ? 'is-next' : ''].join(' ')
          return (
            <div key={j} role="listitem" className={cls}>
              <span className="kill-view__index">{`Monster ${j}`}</span>
              <strong>{`power ${p}`}</strong>
              <span className="kill-view__tag">{killed ? 'killed' : 'alive'}</span>
            </div>
          )
        })}
      </div>
      <p className="kill-view__rate" aria-live="polite">
        {`Growth rate ${factor}`}
        {picked >= 0 ? ` · monster ${picked} needs ceil(${power[picked]} / ${factor}) = ${days} days` : ''}
      </p>
      <div className="kill-view__table" role="table" aria-label="Best days for each set of killed monsters">
        {rows.map(m => {
          const value = best[m]
          const cls = ['kill-view__cell', m === mask ? 'is-settling' : '', m === candidate ? 'is-target' : '', value === null ? 'is-unreached' : ''].join(' ')
          return (
            <div key={m} role="cell" className={cls}>
              <span className="kill-view__bits">{bits(m, n)}</span>
              <strong>{value === null ? 'none' : value}</strong>
            </div>
          )
        })}
      </div>
      {phase === 'done' && order.length > 0 && (
        <p className="kill-view__order">{`Kill order: ${order.join(' → ')}`}</p>
      )}
    </div>
  )
}
