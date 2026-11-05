import GraphTraversalView from '../../components/shared/GraphTraversalView'

// The tree with the current subset highlighted, and a bar for each diameter count.
export default function View({ run, step }) {
  const { n, edges } = run.input
  const zeroBased = edges.map(([u, v]) => [u - 1, v - 1])
  const counts = step.snapshot.counts ?? run.result
  const max = Math.max(1, ...counts)
  return <div className="subtree-diameter-view">
    <GraphTraversalView title="City tree" n={n} edges={zeroBased} visited={step.subset ?? []} current={step.phase === 'count' ? step.subset?.[0] ?? null : null} />
    <ol className="subtree-diameter-view__bars" aria-label="Subsets by diameter">
      {counts.map((c, i) => <li key={i} data-diameter={i + 1}>
        <span>d = {i + 1}</span>
        <span className="subtree-diameter-view__bar" style={{ width: `${(c / max) * 100}%` }} />
        <strong>{c}</strong>
      </li>)}
    </ol>
    {step.diameter !== undefined && step.diameter !== null && <p>Diameter of this subset: {step.diameter}</p>}
  </div>
}
