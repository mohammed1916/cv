import HeapView from '../../components/shared/HeapView'

// Batches ordered by rot day (soonest first), with their remaining counts, and the day being simulated.
export default function View({ run, step }) {
  const batches = step.snapshot.batches
  return <div className="apple-view">
    <HeapView title="Fresh batches by rot day (soonest on top)" items={batches.map(b => b.expire)} ops={[]} order="min" />
    <table aria-label="Batches">
      <thead><tr><th>Rots on day</th><th>Apples left</th></tr></thead>
      <tbody>{batches.map((b, i) => <tr key={i}><td>{b.expire}</td><td>{b.count}</td></tr>)}</tbody>
    </table>
    <dl>
      <dt>Day</dt><dd>{step.day >= 0 ? step.day : '-'}</dd>
      <dt>Eaten so far</dt><dd>{step.snapshot.eaten}</dd>
    </dl>
    <p>{step.message}</p>
  </div>
}
