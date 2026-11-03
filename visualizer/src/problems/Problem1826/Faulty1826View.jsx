const CELL_LABEL = {
  same: 'in place',
  shift: 'one slot left',
  bad: 'mismatch',
  free: 'free value',
}

function Row({ title, values, states, role }) {
  return (
    <div className="faulty-row" role="group" aria-label={title}>
      <p className="faulty-row__title">{title}</p>
      <ol className="faulty-row__cells">
        {values.map((value, index) => {
          const state = states[index] || ''
          const label = state ? CELL_LABEL[state] || state : ''
          return (
            <li key={index} className={`faulty-cell faulty-cell--${state || 'idle'}`} data-state={state || 'idle'}>
              <span className="faulty-cell__index">{index}</span>
              <span className="faulty-cell__value">{value}</span>
              <span className="faulty-cell__label">{label}</span>
            </li>
          )
        })}
      </ol>
      {role ? <p className="faulty-row__role">{role}</p> : null}
    </div>
  )
}

export default function Faulty1826View({ run, step }) {
  const { sensor1, sensor2 } = run.input
  const candidate = step.candidate
  const n = sensor1.length
  const faultyIsOne = candidate === 1
  const faultyValues = faultyIsOne ? sensor1 : sensor2
  const originalValues = faultyIsOne ? sensor2 : sensor1
  const cells = step.cells ?? []
  const faultyStates = candidate ? faultyValues.map((_, k) => cells[k] || '') : faultyValues.map(() => '')
  const originalStates = originalValues.map(() => '')
  if (candidate && step.drop >= 0) {
    originalStates[step.drop] = 'dropped'
    const comparedUpTo = cells.reduce((last, state, index) => (state ? index : last), -1)
    if (comparedUpTo >= 0 && comparedUpTo < n - 1) {
      const src = comparedUpTo < step.drop ? comparedUpTo : comparedUpTo + 1
      originalStates[src] = originalStates[src] === 'dropped' ? 'dropped' : 'source'
    }
    if (cells[n - 1] === 'free') originalStates[n - 1] = originalStates[n - 1] || ''
  }
  const sensor1States = faultyIsOne ? faultyStates : originalStates
  const sensor2States = faultyIsOne ? originalStates : faultyStates
  const fmtFound = step.found.length ? step.found.join(' and ') : 'none yet'
  const verdict = step.phase === 'done' ? (run.result === -1 ? 'Result: -1' : `Result: sensor ${run.result}`) : 'Result pending'

  return (
    <section className="faulty-view" aria-label="Faulty sensor comparison">
      <div className="faulty-view__legend" aria-hidden="true">
        <span className="faulty-key faulty-key--same">in place</span>
        <span className="faulty-key faulty-key--shift">one slot left</span>
        <span className="faulty-key faulty-key--bad">mismatch</span>
        <span className="faulty-key faulty-key--free">free value</span>
        <span className="faulty-key faulty-key--dropped">dropped</span>
        <span className="faulty-key faulty-key--source">compared</span>
      </div>
      <Row title="Sensor 1" values={sensor1} states={sensor1States} role={candidate ? (faultyIsOne ? 'Candidate faulty sensor' : 'Original record') : ''} />
      <Row title="Sensor 2" values={sensor2} states={sensor2States} role={candidate ? (faultyIsOne ? 'Original record' : 'Candidate faulty sensor') : ''} />
      <p className="faulty-view__status" role="status">
        {candidate ? `Testing sensor ${candidate} as faulty` : 'Both readings loaded'}
        {step.drop >= 0 ? `, drop index ${step.drop}` : ''}. Explained so far: {fmtFound}. {verdict}.
      </p>
    </section>
  )
}
