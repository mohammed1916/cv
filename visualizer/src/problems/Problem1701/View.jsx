import IntervalView from '../../components/shared/IntervalView'

// Cooking time for each order on a time line, with the arrival-to-finish wait listed.
export default function View({ run, step }) {
  const orders = step.snapshot.orders
  const intervals = orders.map((o, i) => ({
    start: o.start, end: o.finish, label: `#${i + 1}`,
    role: i === step.index ? 'active' : i < orders.length && (step.phase === 'done' || i < step.index) ? 'done' : 'pending',
  }))
  return <div className="waiting-time-view">
    {intervals.length > 0 && <IntervalView title="Cooking intervals" intervals={intervals} />}
    <table aria-label="Orders">
      <thead><tr><th>Order</th><th>Arrives</th><th>Starts</th><th>Done</th><th>Waits</th></tr></thead>
      <tbody>{run.input.map((_, i) => {
        const o = orders[i]
        return <tr key={i} className={i === step.index ? 'is-current' : ''}>
          <td>{i + 1}</td><td>{run.input[i][0]}</td><td>{o ? o.start : ''}</td><td>{o ? o.finish : ''}</td><td>{o ? o.wait : ''}</td>
        </tr>
      })}</tbody>
    </table>
    <p>{step.message}</p>
  </div>
}
