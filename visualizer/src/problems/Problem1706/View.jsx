// The grid with the arrows of each cell; the current ball's path is highlighted.
export default function View({ run, step }) {
  const grid = run.input
  const onPath = new Set((step.path ?? []).map(([r, c]) => `${r},${c}`))
  return <div className="ball-grid-view">
    <table aria-label="Grid of deflectors">
      <tbody>{grid.map((row, r) => <tr key={r}>
        {row.map((v, c) => <td key={c} className={onPath.has(`${r},${c}`) ? 'is-path' : ''} data-row={r} data-col={c}>{v === 1 ? '→' : '←'}</td>)}
      </tr>)}</tbody>
    </table>
    <ol aria-label="Result so far">{step.snapshot.result.map((v, i) => <li key={i}>column {i}: {v}</li>)}</ol>
    <p>{step.message}</p>
  </div>
}
