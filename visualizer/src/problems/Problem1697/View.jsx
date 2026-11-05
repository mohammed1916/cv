// Components as labels per node, the edges in join order, and the queries with their answers.
export default function View({ run, step }) {
  const { n, edgeList, queries } = run.input
  const roots = step.snapshot.roots ?? Array.from({ length: n }, (_, i) => i)
  const answered = run.result.map((v, j) => ({ v, j }))
  return <div className="edge-limit-view">
    <table aria-label="Component of each node">
      <thead><tr><th>Node</th>{Array.from({ length: n }, (_, i) => <th key={i}>{i}</th>)}</tr></thead>
      <tbody><tr><th>Component</th>{roots.map((r, i) => <td key={i} data-root={r}>{r}</td>)}</tr></tbody>
    </table>
    <table aria-label="Edges sorted by distance">
      <thead><tr><th>Edge</th><th>Distance</th><th>Joined</th></tr></thead>
      <tbody>{[...edgeList].sort((a, b) => a[2] - b[2]).map(([u, v, d], i) => <tr key={i} className={step.snapshot.edge && step.snapshot.edge[0] === u && step.snapshot.edge[1] === v ? 'is-current' : ''}>
        <td>{u}-{v}</td><td>{d}</td><td>{i < (step.snapshot.joinedCount ?? 0) ? 'yes' : ''}</td>
      </tr>)}</tbody>
    </table>
    <table aria-label="Queries">
      <thead><tr><th>Query</th><th>p</th><th>q</th><th>limit</th><th>Answer</th></tr></thead>
      <tbody>{queries.map(([p, q, limit], j) => <tr key={j} className={step.query === j ? 'is-current' : ''}>
        <td>{j + 1}</td><td>{p}</td><td>{q}</td><td>{limit}</td><td>{step.phase === 'done' || (step.snapshot.answerFor !== undefined && j <= step.snapshot.answerFor) ? String(answered[j].v) : ''}</td>
      </tr>)}</tbody>
    </table>
    <p>{step.message}</p>
  </div>
}
