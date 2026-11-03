import './Problem3930View.css'

// A sorted row of tiles (smallest on the left). The inserted value is highlighted, and the k-th largest is the
// tile at position size - k, marked with an arrow. The power box shows p before and after the update.
export default function Problem3930View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pw-view" aria-label="Sorted list and power update">
        <p className="pw-empty">Press Play to insert each value in order and watch the k-th largest pick the exponent.</p>
      </section>
    )
  }

  const { arr, p } = step
  const size = arr.length
  const kthIndex = step.k !== null && step.k !== undefined && size > 0 ? size - step.k : -1
  const insertedAt = step.insertAt

  return (
    <section className="pw-view" aria-label="Sorted elements and p">
      <p className="pw-rule">Sorted elements, smallest first. The k-th largest is found by counting down from the right.</p>
      <div className="pw-row" role="list" aria-label={`${size} sorted elements`}>
        {arr.length === 0 && <span className="pw-empty">no elements yet</span>}
        {arr.map((v, i) => {
          const cls = ['pw-tile', i === insertedAt && step.phase !== 'start' ? 'pw-tile--new' : '', i === kthIndex ? 'pw-tile--kth' : ''].filter(Boolean).join(' ')
          return (
            <div key={i} role="listitem" className={cls}>
              <span className="pw-val">{v}</span>
              <span className="pw-idx">{i}</span>
              {i === kthIndex && <span className="pw-tag">k-th</span>}
            </div>
          )
        })}
      </div>
      <div className="pw-boxes">
        <div className="pw-box">
          <span className="pw-label">query</span>
          <strong>{step.query >= 0 ? `${step.value}, k = ${step.k}` : '-'}</strong>
        </div>
        <div className="pw-box">
          <span className="pw-label">x (the chosen element)</span>
          <strong>{step.x === null || step.x === undefined ? '-' : step.x}</strong>
        </div>
        <div className="pw-box pw-box--p">
          <span className="pw-label">p</span>
          <strong>{p}</strong>
        </div>
      </div>
      <p className="pw-message">{step.message}</p>
    </section>
  )
}
