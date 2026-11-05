// The prefix XOR grid with the current cell highlighted; once sorted, the kth value is marked.
export default function View({ run, step }) {
  const { matrix, k } = run.input
  const pre = step.snapshot.pre
  const [ci, cj] = step.cell ?? [-1, -1]
  return <div className="kth-xor-view">
    <table aria-label="Prefix XOR values">
      <tbody>{matrix.map((row, i) => <tr key={i}>
        {row.map((_, j) => {
          const current = i === ci && j === cj
          return <td key={j} className={current ? 'is-current' : ''} data-cell={`${i},${j}`}>{pre[i + 1][j + 1]}</td>
        })}
      </tr>)}</tbody>
    </table>
    {step.sorted && <ol aria-label="Sorted values">{step.sorted.map((v, i) => <li key={i} className={step.kth === i ? 'is-current' : ''}>{v}</li>)}</ol>}
    <p>k = {k}</p>
    <p>{step.message}</p>
  </div>
}
