import IndexedSequence from '../../components/shared/IndexedSequence'

// The matrix with the current row, the column heights and the sorted heights with the rectangle being measured.
export default function View({ run, step }) {
  const matrix = run.input
  const row = step.row ?? 0
  const h = step.snapshot.h
  const sorted = step.sorted ?? []
  return <div className="submatrix-view">
    <table aria-label="Matrix">
      <tbody>{matrix.map((r, i) => <tr key={i} className={i === row ? 'is-current' : ''}>
        {r.map((v, c) => <td key={c} className={v === 1 ? 'is-one' : ''}>{v}</td>)}
      </tr>)}</tbody>
    </table>
    <IndexedSequence label="Heights of runs of 1s ending in this row" length={h.length} active={-1} valueAt={i => h[i]} roleAt={() => ''} />
    {sorted.length > 0 && <IndexedSequence label="Heights sorted from tallest" length={sorted.length} active={step.j ?? -1}
      valueAt={i => sorted[i]} roleAt={i => (step.j !== undefined && i <= step.j ? 'in rectangle' : '')} />}
    <p>Best area so far: {step.snapshot.best}</p>
    <p>{step.message}</p>
  </div>
}
