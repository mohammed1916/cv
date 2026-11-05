// Query stage strip: FROM rows, GROUP BY groups, COUNT DISTINCT sets, and the output table.
const STAGES = [['from', 'FROM DailySales'], ['group', 'GROUP BY date, make'], ['aggregate', 'COUNT(DISTINCT ...)'], ['done', 'Output']]

export default function View({ run, step }) {
  const rows = run.input
  const shown = step.phase === 'from' || step.phase === 'group' || step.phase === 'aggregate' ? step.index : rows.length - 1
  return <div className="daily-leads-view">
    <ol aria-label="Query stages" className="daily-leads-view__stages">
      {STAGES.map(([id, label]) => <li key={id} aria-current={step.phase === id ? 'step' : undefined} className={step.phase === id ? 'is-active' : ''}>{label}</li>)}
    </ol>
    <table aria-label="DailySales rows">
      <thead><tr><th>date_id</th><th>make_name</th><th>lead_id</th><th>partner_id</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className={i === shown ? 'is-current' : ''}>
        <td>{r.date_id}</td><td>{r.make_name}</td><td>{r.lead_id}</td><td>{r.partner_id}</td>
      </tr>)}</tbody>
    </table>
    <table aria-label="Groups">
      <thead><tr><th>date_id</th><th>make_name</th><th>leads seen</th><th>partners seen</th></tr></thead>
      <tbody>{step.snapshot.groups.map(g => <tr key={`${g.date}|${g.make}`} className={step.snapshot.current === `${g.date}|${g.make}` ? 'is-current' : ''}>
        <td>{g.date}</td><td>{g.make}</td><td>{g.leads.join(', ')}</td><td>{g.partners.join(', ')}</td>
      </tr>)}</tbody>
    </table>
    {step.phase === 'done' && <table aria-label="Output">
      <thead><tr><th>date_id</th><th>make_name</th><th>unique_leads</th><th>unique_partners</th></tr></thead>
      <tbody>{run.result.map((r, i) => <tr key={i}><td>{r.date_id}</td><td>{r.make_name}</td><td>{r.unique_leads}</td><td>{r.unique_partners}</td></tr>)}</tbody>
    </table>}
    <p>{step.message}</p>
  </div>
}
