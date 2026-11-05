// The bank as weeks (rows) by weekday (columns); the amount deposited on the current day is highlighted.
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function View({ run, step }) {
  const weeks = step.snapshot.weeks
  const current = step.day
  const currentWeek = current >= 0 ? Math.floor(current / 7) : -1
  return <div className="bank-view">
    <table aria-label="Deposits by week and weekday">
      <thead><tr><th>Week</th>{DAYS.map(d => <th key={d}>{d}</th>)}</tr></thead>
      <tbody>{weeks.map((row, w) => <tr key={w}>
        <th>{w + 1}</th>
        {DAYS.map((d, k) => <td key={k} className={w === currentWeek && w * 7 + k === current ? 'is-current' : ''}>{row[k] ?? ''}</td>)}
      </tr>)}</tbody>
    </table>
    <p>Total saved: {step.snapshot.total}</p>
    <p>{step.message}</p>
  </div>
}
