import './RoadLanesView.css'

// Two lane rows of mile values. The entry and exit span are outlined, the lane a route is in is shaded, and the switch table lists dp totals by lane and switches used.
export default function RoadLanesView({ run, step }) {
  if (!run || !step) return <section className="road-view"><p className="road-empty">Press Play to walk the routes along the road.</p></section>
  const { lanes } = run.input
  const { entry, mile, dp, bestRoute } = step
  const miles = lanes[0].length
  const laneNames = ['Lane one', 'Lane two']
  const cell = v => (v === null || v === undefined ? '-' : v)
  return (
    <section className="road-view" aria-label="Two lane road with mile values">
      <div className="road-grid" style={{ gridTemplateColumns: `72px repeat(${miles}, minmax(34px, 1fr))` }}>
        <span />
        {Array.from({ length: miles }, (_, m) => (
          <span key={`h${m}`} className={`road-mile${m === mile ? ' road-mile--current' : ''}${entry >= 0 && m >= entry ? ' road-mile--span' : ''}`}>mile {m}</span>
        ))}
        {lanes.map((row, lane) => (
          <FragmentRow key={lane} name={laneNames[lane]} row={row} lane={lane} mile={mile} entry={entry} bestRoute={bestRoute} />
        ))}
      </div>
      {dp && (
        <table className="road-table" aria-label="Best totals by lane and switches used">
          <caption>Best total so far by lane and switches used</caption>
          <thead><tr><th>Lane</th><th>0 switches</th><th>1 switch</th><th>2 switches</th></tr></thead>
          <tbody>
            {dp.map((row, lane) => (
              <tr key={lane}>
                <th scope="row">{laneNames[lane]}</th>
                {row.map((v, used) => <td key={used}>{cell(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="road-summary">
        {entry >= 0 && mile >= 0 ? `Route from mile ${entry}, now at mile ${mile}. ` : ''}
        {bestRoute ? `Best so far ${step.best}: enter ${bestRoute.entry}, exit before ${bestRoute.exit}.` : 'No route recorded yet.'}
      </p>
    </section>
  )
}

function FragmentRow({ name, row, lane, mile, entry, bestRoute }) {
  return (
    <>
      <span className="road-lane">{name}</span>
      {row.map((value, m) => {
        const inBest = bestRoute && bestRoute.lane === lane && m >= bestRoute.entry && m < bestRoute.exit
        const cls = ['road-value', m === mile ? 'road-value--current' : '', entry >= 0 && m >= entry && m <= mile ? 'road-value--walked' : '', inBest ? 'road-value--best' : ''].join(' ')
        return <span key={m} className={cls}>{value}</span>
      })}
    </>
  )
}
