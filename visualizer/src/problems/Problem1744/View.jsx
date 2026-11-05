import IntervalView from '../../components/shared/IntervalView'

// For the current query: the candy numbers of the favourite type against the numbers you can have eaten by its day.
export default function View({ run, step }) {
  const { queries } = run.input
  const p = step.prefix
  const q = step.query >= 0 ? queries[step.query] : null
  const intervals = q ? [
    { start: p[q[0]] + 1, end: p[q[0] + 1], label: 'favourite type', role: 'active' },
    { start: q[1] + 1, end: (q[1] + 1) * q[2], label: `day ${q[1]}, cap ${q[2]}`, role: step.verdict === undefined ? 'pending' : step.verdict ? 'done' : 'pending' },
  ] : []
  return <div className="candy-view">
    <table aria-label="Candy number ranges by type">
      <thead><tr><th>Type</th><th>First candy number</th><th>Last candy number</th></tr></thead>
      <tbody>{p.slice(1).map((end, i) => <tr key={i} className={q && q[0] === i ? 'is-current' : ''}><td>{i}</td><td>{p[i] + 1}</td><td>{end}</td></tr>)}</tbody>
    </table>
    {q && <IntervalView title="Favourite candies against eating pace" intervals={intervals} closed />}
    <p>Answers: {step.snapshot.answers.map(String).join(', ') || 'none yet'}</p>
    <p>{step.message}</p>
  </div>
}
