import './CostCandidateView.css'

const SEGMENT_LABELS = { both: 'combined', single: 'single' }

function Bar({ label, need, combined, single, excess, scale }) {
  const pct = value => `${Math.max(0, value) / scale * 100}%`
  return <div className="cost-bar">
    <div className="cost-bar__head"><span>{label}</span><span>need {need}, covered {combined + single}</span></div>
    <div className="cost-bar__track" role="img"
      aria-label={`${label}: ${combined} ${SEGMENT_LABELS.both} units, ${single} single units, ${Math.max(0, excess)} excess, need ${need}`}>
      <span className="cost-bar__seg cost-bar__seg--both" style={{ width: pct(combined) }}>{combined > 0 ? `${combined} both` : ''}</span>
      <span className="cost-bar__seg cost-bar__seg--single" style={{ width: pct(single) }}>{single > 0 ? `${single} single` : ''}</span>
      <span className="cost-bar__seg cost-bar__seg--excess" style={{ width: pct(excess) }}>{excess > 0 ? `+${excess} excess` : ''}</span>
      <span className="cost-bar__need" style={{ left: pct(need) }} aria-hidden="true">need</span>
    </div>
  </div>
}

export default function CostCandidateView({ step }) {
  const { need1, need2, cost1, cost2, costBoth, rows, candidate, plan, best, phase } = step
  const current = candidate
  const scale = Math.max(1, need1, need2, current ? current.coverage1 : 0, current ? current.coverage2 : 0)
  const shown = plan && phase === 'done' ? plan : current
  const barSource = shown || { both: 0, only1: 0, only2: 0, coverage1: 0, coverage2: 0, excess1: 0, excess2: 0 }
  const liveRows = rows.map(row => ({ ...row, state: row.isBest ? 'best' : 'done' }))
  if (current && (phase === 'candidate' || phase === 'split' || phase === 'cost' || phase === 'compare' || phase === 'update')) {
    if (phase !== 'compare' && phase !== 'update') liveRows.push({ ...current, state: 'current', total: current.total })
  }
  return <section className="cost-view" aria-label="Combined-count candidate table">
    <p className="cost-view__caption">Costs: combined {costBoth} each, need-1 single {cost1}, need-2 single {cost2}. Needs: {need1} and {need2}.</p>
    <div className="cost-view__table-wrap">
      <table className="cost-view__table">
        <thead>
          <tr>
            <th scope="col">Combined</th><th scope="col">Single 1</th><th scope="col">Single 2</th>
            <th scope="col">Cover 1 / need</th><th scope="col">Cover 2 / need</th>
            <th scope="col">Combined cost</th><th scope="col">Single 1 cost</th><th scope="col">Single 2 cost</th>
            <th scope="col">Total</th><th scope="col">Mark</th>
          </tr>
        </thead>
        <tbody>
          {liveRows.map(row => <tr key={`${row.index}-${row.state}`} data-state={row.state} className={`cost-view__row cost-view__row--${row.state}`}>
            <td>{row.both}</td><td>{row.only1}</td><td>{row.only2}</td>
            <td>{row.coverage1} / {need1}{row.excess1 > 0 ? ` (+${row.excess1})` : ''}</td>
            <td>{row.coverage2} / {need2}{row.excess2 > 0 ? ` (+${row.excess2})` : ''}</td>
            <td>{row.costBoth}</td><td>{row.cost1Part}</td><td>{row.cost2Part}</td>
            <td>{row.total ?? '...'}</td>
            <td>{row.state === 'best' ? 'best so far' : row.state === 'current' ? 'testing' : ''}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {!current && phase === 'start' && <p className="cost-view__note">No candidate is tested yet.</p>}
    <div className="cost-view__bars">
      <Bar label="Requirement 1" need={need1} combined={barSource.both ?? 0} single={barSource.only1 ?? 0}
        excess={barSource.excess1 ?? 0} scale={scale} />
      <Bar label="Requirement 2" need={need2} combined={barSource.both ?? 0} single={barSource.only2 ?? 0}
        excess={barSource.excess2 ?? 0} scale={scale} />
    </div>
    {plan && <aside className="cost-view__plan" aria-label="Winning purchase plan">
      <strong>{phase === 'done' ? 'Final plan' : 'Best plan so far'}: total {best}</strong>
      <span>Buy {plan.both} combined, {plan.only1} single for requirement 1, {plan.only2} single for requirement 2.</span>
      {plan.excess2 > 0 && <span>Requirement 2 gets {plan.excess2} extra unit{plan.excess2 === 1 ? '' : 's'}, which is cheaper than buying singles for it.</span>}
    </aside>}
  </section>
}
