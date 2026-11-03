import './HexTableView.css'

export default function HexTableView({ run, step }) {
  const decimal = run.input
  return <div className="hex-view">
    <p className="hex-view__decimal">decimal <strong>{decimal}</strong>{step.n !== null ? ` · remaining ${step.n}` : ''}</p>
    <section aria-label="Division steps">
      <span className="hex-view__label">hex digits, lowest first</span>
      <ol className="hex-view__row">
        {step.hex.map((digit, k) => <li key={k} className={k === step.hex.length - 1 && step.phase === 'divide' ? 'is-new' : ''}>{digit}</li>)}
        {step.hex.length === 0 && <li className="hex-view__empty">none yet</li>}
      </ol>
    </section>
    <section aria-label="Mapping">
      <span className="hex-view__label">mapped, most significant first</span>
      <ol className="hex-view__row">
        {(step.phase === 'reverse' || step.phase === 'map' || step.phase === 'done' || step.phase === 'error')
          && step.hex.map((digit, k) => {
            const mappedDone = k < step.mapped.length
            return <li key={k} className={`${mappedDone ? 'is-mapped' : ''}${digit === '0' || digit === '1' ? ' is-swap' : ''}`}>
              <span>{digit}</span>{mappedDone && <em>{step.mapped[k]}</em>}
            </li>
          })}
      </ol>
    </section>
    <output aria-label="Hexspeak result">
      {step.result ? `Hexspeak: ${step.result}` : step.error ? 'ERROR: a digit 2 to 9 is present' : 'building the hex digits'}
    </output>
  </div>
}
