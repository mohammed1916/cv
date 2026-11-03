import './Problem3935View.css'

// One row per query. The row shows the value inserted, the sorted list after insertion, the element x chosen
// by k, and p before and after. A bar scales x so the size of each exponent is easy to compare.
export default function Problem3935View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="qt-view" aria-label="Query table">
        <p className="qt-empty">Press Play to step through the queries one row at a time.</p>
      </section>
    )
  }

  const { queries, nums, p } = run.input
  const rows = queries.map(([value, k], q) => ({ q, value, k }))
  const maxX = Math.max(1, ...run.frames.map(f => (typeof f.x === 'number' ? f.x : 0)))
  const doneRows = step.phase === 'done' ? rows.length : step.query >= 0 ? step.query + (step.phase === 'power' ? 1 : 0) : 0
  const answers = run.result

  return (
    <section className="qt-view" aria-label="Queries, chosen elements and p">
      <p className="qt-rule">Start with {nums.length ? `[${nums.join(', ')}]` : 'an empty list'} and p = {p}. Each query inserts a value, then raises p to the k-th largest element.</p>
      <table className="qt-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">insert</th>
            <th scope="col">k</th>
            <th scope="col">x</th>
            <th scope="col">p after</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const active = row.q === step.query
            const shown = row.q < doneRows
            const x = shown ? (step.phase === 'done' || row.q < step.query ? run.frames.find(f => f.phase === 'power' && f.query === row.q)?.x : step.x) : null
            return (
              <tr key={row.q} className={active ? 'qt-row qt-row--cur' : 'qt-row'}>
                <td>{row.q + 1}</td>
                <td>{row.value}</td>
                <td>{row.k}</td>
                <td>
                  {shown && x !== null && x !== undefined ? (
                    <span className="qt-bar-wrap">
                      <span className="qt-bar" style={{ width: `${Math.round((x / maxX) * 100)}%` }} />
                      <strong>{x}</strong>
                    </span>
                  ) : '-'}
                </td>
                <td>{shown && answers[row.q] !== undefined ? answers[row.q] : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="qt-message">{step.message}</p>
    </section>
  )
}
