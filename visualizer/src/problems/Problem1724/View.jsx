import GraphTraversalView from '../../components/shared/GraphTraversalView'

// The minimum spanning forest (only edges that joined components), with the queried pair highlighted.
export default function View({ run, step }) {
  const { n, queries } = run.input
  const forest = step.snapshot.forest ?? []
  const edges = forest.map(([u, v]) => [u, v])
  const pair = step.path ? [step.path.p, step.path.q] : []
  return <div className="limited-paths-view">
    <GraphTraversalView title="Forest of shortest joins" n={n} edges={edges} visited={pair} current={step.edge ? step.edge[0] : null} />
    <table aria-label="Queries">
      <thead><tr><th>Query</th><th>p</th><th>q</th><th>limit</th><th>Answer</th></tr></thead>
      <tbody>{queries.map(([p, q, limit], j) => <tr key={j} className={step.query === j ? 'is-current' : ''}>
        <td>{j + 1}</td><td>{p}</td><td>{q}</td><td>{limit}</td>
        <td>{step.snapshot.answers && j < step.snapshot.answers.length ? String(step.snapshot.answers[j]) : ''}</td>
      </tr>)}</tbody>
    </table>
    <p>{step.message}</p>
  </div>
}
