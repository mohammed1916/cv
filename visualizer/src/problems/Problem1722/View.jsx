import GraphTraversalView from '../../components/shared/GraphTraversalView'
import IndexedSequence from '../../components/shared/IndexedSequence'

// The swap graph with the current group highlighted, and the source and target values of each group.
export default function View({ run, step }) {
  const { source, target, allowedSwaps } = run.input
  const n = source.length
  const members = step.members ?? []
  return <div className="hamming-view">
    <GraphTraversalView title="Allowed swaps" n={n} edges={allowedSwaps} visited={members} current={step.position ?? null} />
    <IndexedSequence label="Source values" length={n} active={step.position ?? -1} valueAt={i => source[i]} roleAt={i => (members.includes(i) ? 'in group' : '')} />
    <IndexedSequence label="Target values" length={n} active={step.position ?? -1} valueAt={i => target[i]} roleAt={i => (members.includes(i) ? 'in group' : '')} />
    <table aria-label="Groups">
      <thead><tr><th>Group</th><th>Positions</th><th>Source</th><th>Target</th></tr></thead>
      <tbody>{run.groups.map((g, k) => <tr key={k} className={step.group === k ? 'is-current' : ''}>
        <td>{k + 1}</td><td>{g.join(', ')}</td><td>{g.map(i => source[i]).join(', ')}</td><td>{g.map(i => target[i]).join(', ')}</td>
      </tr>)}</tbody>
    </table>
    <p>Distance so far: {step.snapshot.distance}</p>
    <p>{step.message}</p>
  </div>
}
