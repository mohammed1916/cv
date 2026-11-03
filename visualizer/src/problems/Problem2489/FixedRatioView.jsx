import './FixedRatioView.css'

export default function FixedRatioView({ run, step }) {
  const { s, num1, num2 } = run.input
  const r = step.r
  const matches = new Set(step.matches ?? [])
  return (
    <div className="fr-view">
      <p className="fr-rule">Zeros count num2 = {num2} each, ones subtract num1 = {num1} each. Equal keys mean zeros : ones = {num1} : {num2}.</p>
      <div className="fr-track" role="list" aria-label="Prefix positions with keys">
        {Array.from({ length: s.length + 1 }, (_, i) => {
          const role = i === r ? 'now' : matches.has(i) ? 'match' : i < r ? 'past' : 'future'
          return (
            <div key={i} role="listitem" className={`fr-cell fr-cell--${role}`} data-role={role}>
              <span className="fr-cell__index">{i}</span>
              <span className="fr-cell__key">{step.keys[i]}</span>
              {i > 0 && <span className="fr-cell__char" aria-label={`character ${i}`}>{s[i - 1]}</span>}
            </div>
          )
        })}
      </div>
      <p className="fr-note">
        {step.matches?.length
          ? `Earlier prefixes ${step.matches.join(', ')} match the key ${step.keys[r]}; each gives a substring ending at ${r}.`
          : `Key ${step.keys[r] ?? 0} has not appeared before this position.`}
      </p>
      <div className="fr-seen" aria-label="Keys seen so far">
        <span className="fr-seen__title">Seen</span>
        {(step.seen ?? []).map(entry => (
          <span key={entry.key} className={`fr-chip${entry.key === step.keys[r] ? ' fr-chip--active' : ''}`}>
            key {entry.key}: {entry.count}
          </span>
        ))}
      </div>
      <output className="fr-answer" aria-label="Running answer">Answer so far: {step.answer}</output>
    </div>
  )
}
