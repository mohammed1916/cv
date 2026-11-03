import './LetterParityView.css'

export default function LetterParityView({ run, step }) {
  const { num } = run.input
  const current = step.letter ? step.letter.charCodeAt(0) - 97 : -1
  return (
    <figure className="letter-parity-view">
      <div className="letter-parity-view__digits" aria-label="Digits of the number">
        {[...num].map((d, p) => (
          <span key={p} className={`digit ${p === step.digit ? 'digit--current' : p < step.digit ? 'digit--done' : ''}`}>{d}</span>
        ))}
      </div>
      <p className="letter-parity-view__word" aria-live="polite">
        {step.word ? `Spelled: ${step.word}` : 'Digits are spelled one at a time.'}
      </p>
      <div className="letter-parity-view__grid" role="list" aria-label="Letter parity">
        {step.odd.map((isOdd, i) => {
          const letter = String.fromCharCode(97 + i)
          const cls = ['letter-cell', isOdd ? 'letter-cell--odd' : '', i === current ? 'letter-cell--current' : ''].join(' ').trim()
          return (
            <span key={letter} role="listitem" className={cls}>
              <b>{letter}</b>
              <small>{isOdd ? 'odd' : 'even'}</small>
            </span>
          )
        })}
      </div>
      <p className="letter-parity-view__count">{`Odd letters so far: ${step.odd.filter(Boolean).length}`}</p>
    </figure>
  )
}
