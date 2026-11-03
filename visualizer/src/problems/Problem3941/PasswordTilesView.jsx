import './PasswordTilesView.css'

const LABEL = { lower: 'lowercase +1', upper: 'uppercase +2', digit: 'digit +3', symbol: 'symbol +5' }

export default function PasswordTilesView({ run, step }) {
  const chars = [...run.input.password]
  return (
    <section className="password-tiles" aria-label="Password characters">
      <ol className="password-tiles__row">
        {chars.map((ch, i) => (
          <li key={i} className={`password-tiles__tile${i === step.index ? ' is-current' : i < step.index ? ' is-read' : ''}`}>
            <strong>{ch}</strong>
            <span>{i}</span>
          </li>
        ))}
      </ol>
      <p role="status">{step.ch === null ? step.message : `${step.ch}: ${step.added ? `${LABEL[step.kind]}, added` : 'already counted, adds nothing'}`}</p>
      <div className="password-tiles__seen" aria-label="Characters counted so far">
        {step.seen.map(ch => <code key={ch}>{ch}</code>)}
      </div>
      <output aria-label="Running score">Score: {step.score}</output>
    </section>
  )
}
