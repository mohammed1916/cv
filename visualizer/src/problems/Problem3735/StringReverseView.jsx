import './StringReverseView.css'

// The original string as tiles. The reversed span of the current candidate is outlined; the candidate
// string and the best string so far are printed beneath it.
export default function StringReverseView({ run, step }) {
  if (!run || !step) return <section className="sr-view"><p className="sr-empty">Press Play to try every prefix and suffix reversal.</p></section>
  const s = run.input
  const [from, to] = step.span || [-1, -1]
  return (
    <section className="sr-view" aria-label="Reversal candidates">
      <div className="sr-tiles" aria-label="Original string">
        {[...s].map((ch, index) => {
          const classes = ['sr-tile']
          if (index >= from && index <= to) classes.push('sr-tile--span')
          return (
            <div key={index} className={classes.join(' ')}>
              <span className="sr-letter">{ch}</span>
              <span className="sr-index">{index}</span>
            </div>
          )
        })}
      </div>
      <div className="sr-line">
        <span className="sr-label">{step.span ? `${step.phase} of length ${step.k}` : 'original'}</span>
        <code className="sr-candidate" aria-label="Candidate string">{step.candidate ?? s}</code>
        {step.improved ? <span className="sr-tag">new best</span> : null}
      </div>
      <div className="sr-line">
        <span className="sr-label">best</span>
        <code className="sr-best" aria-label="Best string so far">{step.best}</code>
        <span className="sr-by">{step.bestBy ? `from ${step.bestBy}` : 'no reversal yet'}</span>
      </div>
      <p className="sr-key">Outlined tiles are the reversed span. Length one changes nothing, so it is a harmless candidate.</p>
    </section>
  )
}
