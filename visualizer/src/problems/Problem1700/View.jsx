import IndexedSequence from '../../components/shared/IndexedSequence'

// The sandwich stack (top first) with the current one marked, and the wanted counts that shrink as sandwiches are served.
export default function View({ run, step }) {
  const { sandwiches } = run.input
  const labels = ['circular 0', 'square 1']
  return <div className="lunch-view">
    <IndexedSequence label="Sandwiches from the top of the stack" length={sandwiches.length} active={step.index}
      valueAt={i => (sandwiches[i] === 0 ? 'C' : 'S')} roleAt={i => (i < step.index ? 'served' : '')} />
    <table aria-label="Students still wanting each sandwich">
      <thead><tr><th>Sandwich</th><th>Students wanting it</th></tr></thead>
      <tbody>{labels.map((l, k) => <tr key={k}><th>{l}</th><td>{step.snapshot.count[k]}</td></tr>)}</tbody>
    </table>
    <p>Students left in the queue: {step.snapshot.left}</p>
    <p>{step.message}</p>
  </div>
}
