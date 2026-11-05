// Sorted suffixes with the prefix each one shares with the suffix before it, and the new substrings it adds.
export default function View({ run, step }) {
  const rows = step.snapshot.rows
  const total = run.input.length
  return <div className="suffix-view">
    <table aria-label="Sorted suffixes">
      <thead><tr><th>#</th><th>Suffix</th><th>Shared with previous</th><th>New substrings</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={r.start} className={i === step.index ? 'is-current' : ''}>
        <td>{i + 1}</td><td><code>{r.suffix}</code></td><td>{r.shared}</td><td>{r.add}</td>
      </tr>)}</tbody>
    </table>
    <p>Total so far: {step.snapshot.distinct} of the {total} suffixes' contributions</p>
    <p>{step.message}</p>
  </div>
}
