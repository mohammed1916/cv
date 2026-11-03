import './PowerStateView.css'

export default function PowerStateView({ run, step }) {
  const { edges, source, target } = run.input
  const powers = Array.from({ length: step.power + 1 }, (_, p) => p)
  return (
    <section className="power-state" aria-label="Vertex and remaining power states">
      <table aria-label="Earliest time by vertex and remaining power">
        <thead><tr><th>Vertex</th>{powers.map(p => <th key={p}>{`power ${p}`}</th>)}</tr></thead>
        <tbody>
          {step.cost.map((c, v) => (
            <tr key={v} className={step.current && step.current.v === v ? 'power-state__row--current' : ''}>
              <th>{`${v}${v === source ? ' (start)' : ''}${v === target ? ' (goal)' : ''}`}<small>{` cost ${c}`}</small></th>
              {powers.map(p => {
                const t = step.table[v][p]
                const current = step.current && step.current.v === v && step.current.left === p
                const finished = step.done[v][p]
                return <td key={p} className={`${current ? 'power-state__cell--current' : ''} ${finished ? 'power-state__cell--done' : ''}`}>{t === null ? '-' : t}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="power-state__edges" aria-label="Edges">
        {edges.map(([u, v, t], i) => <li key={i} className={step.current && step.current.v === u && step.current.w === v ? 'power-state__edge--hot' : ''}>{`${u} to ${v} takes ${t}`}</li>)}
      </ul>
      <p className="power-state__message">{step.message}</p>
    </section>
  )
}
