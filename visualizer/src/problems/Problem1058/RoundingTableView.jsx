import './RoundingTableView.css'

const SCALE = 1000000
const bar = (value, max) => `${Math.max(2, Math.round((value / max) * 100))}%`

export default function RoundingTableView({ run, step }) {
  const maxFrac = SCALE
  const need = step.ups
  return (
    <figure className="rtv" aria-label="Prices split into rounded-down and rounded-up choices">
      <table className="rtv__table">
        <thead>
          <tr><th>Price</th><th>Floor</th><th>Fraction</th><th>Choice</th><th>Round-up extra</th></tr>
        </thead>
        <tbody>
          {step.rows.map((row, index) => {
            const rank = step.order ? step.order.indexOf(index) : -1
            const current = index === step.current
            return (
              <tr key={index} className={current ? 'rtv__row--now' : ''}>
                <td>{row.text}</td>
                <td>{row.floor}</td>
                <td>
                  <span className="rtv__bar" style={{ width: bar(row.frac, maxFrac) }} aria-hidden="true" />
                  {(row.frac / SCALE).toFixed(3)}
                </td>
                <td>
                  <span className={`rtv__choice rtv__choice--${row.choice}`}>
                    {row.choice === 'whole' ? 'whole' : row.choice === 'up' ? '↑ up' : '↓ down'}
                  </span>
                </td>
                <td>{row.delta === null ? '—' : `${row.delta >= 0 ? '+' : ''}${(row.delta / SCALE).toFixed(3)}${rank >= 0 && step.picked !== undefined && rank < step.picked ? ' (taken)' : rank >= 0 ? ` (rank ${rank + 1})` : ''}`}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <dl className="rtv__stats">
        <div><dt>Round-ups needed</dt><dd>{need}</dd></div>
        <div><dt>Error so far</dt><dd>{(step.error / SCALE).toFixed(3)}</dd></div>
        <div><dt>Result</dt><dd>{step.result ?? 'pending'}</dd></div>
      </dl>
    </figure>
  )
}
