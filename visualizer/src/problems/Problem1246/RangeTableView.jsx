import './RangeTableView.css'

// Upper triangle of ranges: row i is the start, column j is the end. The active cell is outlined.
export default function RangeTableView({ run, step }) {
  const arr = run.input
  const n = arr.length
  return <div className="range-view">
    <ol className="range-view__strip" aria-label="Array values">
      {arr.map((value, index) => <li key={index} className={index >= step.i && index <= step.j && step.i >= 0 ? 'in-range' : ''}>
        <span>{value}</span><small>{index}</small>
      </li>)}
    </ol>
    <table aria-label="Cost of each range">
      <thead>
        <tr><th scope="col">i \ j</th>{arr.map((_, j) => <th key={j} scope="col">{j}</th>)}</tr>
      </thead>
      <tbody>
        {Array.from({ length: n }, (_, i) => <tr key={i}>
          <th scope="row">{i}</th>
          {arr.map((_, j) => {
            if (j < i) return <td key={j} className="is-empty" />
            const cell = step.table[i][j]
            const classes = []
            if (i === step.i && j === step.j) classes.push('is-active')
            if (cell !== null) classes.push('is-filled')
            return <td key={j} className={classes.join(' ')}>{cell ?? ''}</td>
          })}
        </tr>)}
      </tbody>
    </table>
    <section className="range-view__candidates" aria-label="Candidates for the active range">
      {step.i >= 0 && step.single !== null ? <>
        <p>Range [{step.i}..{step.j}] candidates:</p>
        <ul>
          <li className={step.best === step.single ? 'is-best' : ''}>remove arr[{step.i}] alone: {step.single}</li>
          {step.pairs.map(({ k, cost }) => <li key={k} className={cost === step.best ? 'is-best' : ''}>
            pair arr[{step.i}] with arr[{k}]: {cost}
          </li>)}
        </ul>
      </> : <p>Fill the ranges from length 1 upward.</p>}
      {step.answer !== null && <p className="range-view__answer">answer for the whole array: {step.answer}</p>}
    </section>
  </div>
}
