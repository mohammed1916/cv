import IndexedSequence from '../../components/shared/IndexedSequence'

// Players in sorted order with their best team total; the current player is highlighted.
export default function View({ run, step }) {
  const { players } = run
  const dp = step.snapshot.dp
  const prev = step.snapshot.prev
  const current = step.snapshot.current ?? -1
  return <div className="best-team-view">
    <table aria-label="Players sorted by age then score">
      <thead><tr><th>#</th><th>Age</th><th>Score</th><th>Best team total</th><th>Team extends</th></tr></thead>
      <tbody>{players.map((p, i) => <tr key={p.id} className={i === current ? 'is-current' : ''} data-index={i}>
        <td>{i + 1}</td><td>{p.age}</td><td>{p.score}</td>
        <td>{i <= current || step.phase === 'done' ? dp[i] : '…'}</td>
        <td>{prev[i] >= 0 && i <= current ? `player ${prev[i] + 1}` : (i <= current ? 'new team' : '')}</td>
      </tr>)}</tbody>
    </table>
    <IndexedSequence label="Best total per ending player" length={dp.length} active={current}
      valueAt={i => (i <= current || step.phase === 'done' ? dp[i] : '…')} roleAt={i => (i <= current ? 'done' : '')} />
  </div>
}
