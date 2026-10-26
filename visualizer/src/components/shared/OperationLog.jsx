import './OperationLog.css'

/**
 * Table of design-problem operations and their return values, with the current
 * operation highlighted. Use it for any class-style problem driven by an op list.
 *
 * ops:     [{ name, args, returned }] in execution order (only the first `through + 1` are shown).
 * current: index of the operation being executed, or -1 before the first.
 */
export default function OperationLog({ title = 'Operations', ops = [], current = -1, through = ops.length - 1 }) {
  const shown = ops.slice(0, Math.max(0, through + 1))
  return <section className="operation-log" aria-label={title}>
    <header><strong>{title}</strong><span>{shown.length} of {ops.length}</span></header>
    <table>
      <thead><tr><th>#</th><th>Operation</th><th>Returned</th></tr></thead>
      <tbody>{shown.map((op, i) => <tr key={i} className={i === current ? 'is-current' : ''} aria-current={i === current ? 'step' : undefined}>
        <td>{i}</td>
        <td><code>{op.name}({(op.args ?? []).map(a => JSON.stringify(a)).join(', ')})</code></td>
        <td>{op.returned === undefined ? '—' : op.returned === null ? 'null' : JSON.stringify(op.returned)}</td>
      </tr>)}</tbody>
    </table>
  </section>
}
