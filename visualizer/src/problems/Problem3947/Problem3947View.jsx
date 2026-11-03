import './Problem3947View.css'

// Type cards show price, factor and how many grants the type can make. The strip below shows the best value for
// each budget from 0 up to the total budget, and the cells that changed while the current type was processed are highlighted.
export default function Problem3947View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="si-view" aria-label="Sale items">
        <p className="si-empty">Press Play to add each type's copies to the budget table.</p>
      </section>
    )
  }

  const { budget, types } = run.input
  const grants = types.map((_, s) => (step.type >= s || step.phase === 'done' ? run.frames.find(f => f.type === s && f.grants !== null)?.grants ?? 0 : null))

  return (
    <section className="si-view" aria-label="Types and budget table">
      <p className="si-rule">Budget {budget}. A copy of type s can grant one free copy of a type whose factor it divides, once per pair.</p>
      <div className="si-cards">
        {types.map(([price, factor], s) => {
          const cur = step.type === s
          const done = step.phase === 'done' || step.type > s
          return (
            <div key={s} className={`si-card${cur ? ' si-card--cur' : ''}${done ? ' si-card--done' : ''}`}>
              <strong>type {s}</strong>
              <span>price {price}</span>
              <span>factor {factor}</span>
              <span className="si-grant">{grants[s] === null ? 'grants: -' : `grants: ${grants[s]}`}</span>
            </div>
          )
        })}
      </div>
      <div className="si-strip" role="table" aria-label={`Best value for budgets 0 to ${budget}`}>
        <div className="si-row" role="row">
          <span className="si-head" role="columnheader">budget</span>
          {step.dp.map((_, b) => <span key={b} className="si-head" role="columnheader">{b}</span>)}
        </div>
        <div className="si-row" role="row">
          <span className="si-head" role="rowheader">best</span>
          {step.dp.map((v, b) => <span key={b} role="cell" className={`si-val${b === budget ? ' si-val--answer' : ''}`}>{v}</span>)}
        </div>
      </div>
      <p className="si-message">{step.message}</p>
      <p className="si-note">The answer is the last cell, for budget {budget}.</p>
    </section>
  )
}
