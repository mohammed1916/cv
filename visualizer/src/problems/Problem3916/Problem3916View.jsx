import './Problem3916View.css'

// Table: one column per value from l to r. The "rise" row counts prefixes whose last step went up into that value,
// the "fall" row counts prefixes whose last step went down into it. The cell being updated is highlighted.
export default function Problem3916View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="zz-view" aria-label="Zigzag counts">
        <p className="zz-empty">Press Play to grow zigzag prefixes one length at a time.</p>
      </section>
    )
  }

  const { n, l, r } = run.input
  const values = Array.from({ length: r - l + 1 }, (_, i) => l + i)
  const rise = step.up.length ? step.up : values.map(() => null)
  const fall = step.down.length ? step.down : values.map(() => null)
  const cell = (arr, i) => (arr[i] === null || arr[i] === undefined ? '-' : arr[i])

  return (
    <section className="zz-view" aria-label="Zigzag prefix counts">
      <p className="zz-rule">Neighbours must differ and the steps must alternate up and down. Length {step.length} of {n}.</p>
      <table className="zz-table">
        <thead>
          <tr>
            <th scope="col">value</th>
            {values.map((v, i) => <th key={v} scope="col" className={step.value === i ? 'zz-col zz-col--cur' : 'zz-col'}>{v}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">last step up</th>
            {values.map((v, i) => <td key={v} className={step.value === i && step.phase === 'up' ? 'zz-cell zz-cell--cur' : 'zz-cell'}>{cell(rise, i)}</td>)}
          </tr>
          <tr>
            <th scope="row">last step down</th>
            {values.map((v, i) => <td key={v} className={step.value === i && step.phase === 'down' ? 'zz-cell zz-cell--cur' : 'zz-cell'}>{cell(fall, i)}</td>)}
          </tr>
        </tbody>
      </table>
      <p className="zz-message">{step.message}</p>
      <p className="zz-total">{step.total === null || step.total === undefined ? '' : `Arrays counted so far: ${step.total}`}</p>
    </section>
  )
}
