// The earlier meals with their counts; the current meal's matches are listed as the powers of two they complete.
export default function View({ run, step }) {
  const seen = step.snapshot.seen ?? {}
  const keys = Object.keys(seen).map(Number).sort((a, b) => a - b)
  return <div className="good-meals-view">
    <p>Meals: [{run.input.join(', ')}]</p>
    <table aria-label="Earlier meals seen">
      <thead><tr><th>Value</th><th>Count so far</th></tr></thead>
      <tbody>{keys.map(k => <tr key={k} className={step.value === k ? 'is-current' : ''}><td>{k}</td><td>{seen[k]}</td></tr>)}</tbody>
    </table>
    {step.matches && step.matches.length > 0 && <ul aria-label="Matches for this meal">
      {step.matches.map(m => <li key={m.power}>{step.value} + {m.need} = {m.power}, {m.count} pair{m.count === 1 ? '' : 's'}</li>)}
    </ul>}
    <p>Pairs so far: {step.snapshot.pairs}</p>
    <p>{step.message}</p>
  </div>
}
