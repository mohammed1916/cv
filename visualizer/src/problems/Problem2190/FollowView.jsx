// The array is drawn with key highlighted. Each arrow records a pair (key, next); the tallies show how often each follower occurred.
export default function FollowView({ run, step }) {
  const { nums, key } = run.input
  const pairs = nums.slice(0, -1).map((a, i) => ({ a, b: nums[i + 1], i }))
  const tallies = [...(step.cnt ?? new Map()).entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0])
  return (
    <div className="follow-view">
      <div className="follow-row" role="img" aria-label={`Array ${nums.join(', ')}`}>
        {nums.map((v, i) => <div key={i} className={`follow-cell${v === key ? ' is-key' : ''}${i === step.i || i === step.i + 1 ? ' is-pair' : ''}`}>
          <small>{i}</small><strong>{v}</strong>
        </div>)}
      </div>
      <p>Key: <strong>{key}</strong>. Pairs read so far: {pairs.filter(p => p.i <= (step.i ?? -1)).length} of {pairs.length}.</p>
      <table className="follow-tally" aria-label="Followers of the key">
        <thead><tr><th>follower</th><th>count</th></tr></thead>
        <tbody>{tallies.length ? tallies.map(([v, c]) => <tr key={v} className={v === step.ans ? 'is-leader' : ''}><td>{v}</td><td>{c}</td></tr>) : <tr><td colSpan={2}>No follower yet</td></tr>}</tbody>
      </table>
      <p>Current leader: <strong>{step.ans}</strong> with {step.best}.</p>
    </div>
  )
}
