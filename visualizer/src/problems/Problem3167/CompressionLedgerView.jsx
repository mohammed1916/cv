import './CompressionLedgerView.css'

// The input groups as tokens, the current group highlighted, and an alphabet ledger where
// each letter's running total fills in. Letters with no total stay empty.
export default function CompressionLedgerView({ run, step }) {
  const letters = Array.from({ length: 26 }, (_, k) => String.fromCharCode(97 + k))
  return (
    <section className="ledger-compress" aria-label="Compression ledger">
      <div className="ledger-compress__tokens" role="list" aria-label="Input groups">
        {step.groups.map((group, index) => (
          <span key={index} role="listitem" className={`ledger-compress__token${index === step.group ? ' is-current' : ''}${index < step.group ? ' is-done' : ''}`}>
            {group}
          </span>
        ))}
      </div>
      <div className="ledger-compress__alphabet" role="list" aria-label="Totals per letter">
        {letters.map((letter, k) => {
          const total = step.totals[k]
          const active = letter === step.letter && step.phase !== 'start'
          return (
            <span key={letter} role="listitem" className={`ledger-compress__cell${total > 0 ? ' is-present' : ''}${active ? ' is-active' : ''}`}>
              <b>{letter}</b>
              <small>{total > 0 ? total : '·'}</small>
            </span>
          )
        })}
      </div>
      <p className="ledger-compress__output" role="status">
        Output: <strong>{step.output || '(building)'}</strong>
      </p>
      <p className="ledger-compress__caption">{step.message}</p>
    </section>
  )
}
