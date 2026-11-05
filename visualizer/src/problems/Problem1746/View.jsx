import IndexedSequence from '../../components/shared/IndexedSequence'

// Values with the two running best sums: ending here without the square, and with it.
export default function View({ run, step }) {
  const nums = run.input
  const rows = run.rows.slice(0, (step.index ?? 0) + 1)
  return <div className="square-sum-view">
    <IndexedSequence label="nums" length={nums.length} active={step.index}
      valueAt={i => nums[i]} roleAt={i => (i < rows.length ? '' : '')} />
    <table aria-label="Best subarray sums ending at each index">
      <thead><tr><th>Index</th><th>Value</th><th>Ending here, no square</th><th>Ending here, with square</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className={i === step.index ? 'is-current' : ''}>
        <td>{i}</td><td>{r.x}</td><td>{r.noSq}</td><td>{r.withSq}</td>
      </tr>)}</tbody>
    </table>
    <p>Best with the square so far: {step.snapshot.best}</p>
    <p>{step.message}</p>
  </div>
}
