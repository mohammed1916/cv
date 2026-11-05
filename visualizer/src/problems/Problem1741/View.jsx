// Stage strip, entry rows, the employee-day totals so far, and the output rows.
const STAGES = [['from', 'FROM Employees'], ['group', 'GROUP BY emp_id, event_day'], ['sum', 'SUM(out - in)'], ['done', 'Output']]

export default function View({ run, step }) {
  const rows = run.input
  return <div className="employee-time-view">
    <ol aria-label="Query stages" className="employee-time-view__stages">
      {STAGES.map(([id, label]) => <li key={id} aria-current={step.phase === id ? 'step' : undefined} className={step.phase === id ? 'is-active' : ''}>{label}</li>)}
    </ol>
    <table aria-label="Employees rows">
      <thead><tr><th>emp_id</th><th>event_day</th><th>in_time</th><th>out_time</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className={i === step.index ? 'is-current' : ''}><td>{r.emp_id}</td><td>{r.event_day}</td><td>{r.in_time}</td><td>{r.out_time}</td></tr>)}</tbody>
    </table>
    <table aria-label="Totals so far">
      <thead><tr><th>event_day</th><th>emp_id</th><th>total_time</th></tr></thead>
      <tbody>{step.snapshot.totals.map(t => { const [d, e] = t.key.split('|'); return <tr key={t.key} className={step.snapshot.current === t.key ? 'is-current' : ''}><td>{d}</td><td>{e}</td><td>{t.total}</td></tr> })}</tbody>
    </table>
    <p>{step.message}</p>
  </div>
}
