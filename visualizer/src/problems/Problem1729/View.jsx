// Stage strip, the follow rows as a table, the per-user counts so far, and the ordered output.
const STAGES = [['from', 'FROM Followers'], ['group', 'GROUP BY user_id'], ['count', 'COUNT(follower_id)'], ['done', 'ORDER BY user_id']]

export default function View({ run, step }) {
  const rows = run.input
  const counts = step.snapshot.counts ?? {}
  return <div className="followers-view">
    <ol aria-label="Query stages" className="followers-view__stages">
      {STAGES.map(([id, label]) => <li key={id} aria-current={step.phase === id ? 'step' : undefined} className={step.phase === id ? 'is-active' : ''}>{label}</li>)}
    </ol>
    <table aria-label="Followers rows">
      <thead><tr><th>user_id</th><th>follower_id</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className={i === step.index ? 'is-current' : ''}><td>{r.user_id}</td><td>{r.follower_id}</td></tr>)}</tbody>
    </table>
    <table aria-label="Counts so far">
      <thead><tr><th>user_id</th><th>followers_count</th></tr></thead>
      <tbody>{Object.keys(counts).sort((a, b) => a - b).map(u => <tr key={u} className={String(step.snapshot.current) === u ? 'is-current' : ''}><td>{u}</td><td>{counts[u]}</td></tr>)}</tbody>
    </table>
    <p>{step.message}</p>
  </div>
}
