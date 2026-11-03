import './DifferByOneView.css'

// Shows the word list, the wildcard keys stored so far, and the hit that proves a single-letter difference.
export default function DifferByOneView({ run, step }) {
  const hits = new Set(step.found ?? [])
  return (
    <section className="differ-one" aria-label="Words and wildcard buckets">
      <ol className="differ-one__words" aria-label="Words">
        {run.input.map((word, w) => {
          const role = step.phase === 'hit' && (w === step.word || hits.has(w)) ? 'pair' : step.word === w ? 'current' : ''
          return <li key={w} className={`differ-one__word ${role ? `differ-one__word--${role}` : ''}`} aria-label={`word ${w}: ${word}`}>
            <span className="differ-one__label">{w}</span>
            <span className="differ-one__letters">
              {[...word].map((ch, j) => (
                <span key={j} className={`differ-one__letter ${step.word === w && step.position === j ? 'differ-one__letter--probe' : ''}`}>{ch}</span>
              ))}
            </span>
          </li>
        })}
      </ol>
      <div className="differ-one__keys" aria-label="Wildcard keys stored in seen">
        <h3>seen keys</h3>
        {step.seen.length === 0 ? <p className="differ-one__empty">empty</p> : <ul>
          {step.seen.map(({ key, word }) => <li key={key} className={step.key === key && step.phase === 'hit' ? 'differ-one__key differ-one__key--hit' : 'differ-one__key'}>
            <code>{key}</code> <span>from word {word}</span>
          </li>)}
        </ul>}
        {step.phase === 'mask' || step.phase === 'hit' ? <p className="differ-one__probe">Probe key <code>{step.key}</code></p> : null}
      </div>
    </section>
  )
}
