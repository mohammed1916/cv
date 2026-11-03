import './FrequencyFilterView.css'

// Each letter's total is a chip; totals below k are shaded as rare. Characters of the string
// are tiles in order: kept tiles are filled, dropped ones are struck through, and the current
// tile is outlined.
export default function FrequencyFilterView({ run, step }) {
  const { s, k } = run.input
  const totals = Object.entries(step.freq)
  return <div className="freq-filter" style={{ '--accent': '#7e22ce' }}>
    <ul className="freq-filter__totals" aria-label="Letter totals">
      {totals.map(([letter, n]) => <li key={letter} data-rare={n < k ? 'yes' : 'no'}>{letter}: {n}</li>)}
    </ul>
    <ol className="freq-filter__row" aria-label="Characters of s">
      {[...s].map((ch, i) => {
        let state = ''
        if (step.index === i) state = 'current'
        else if (i < (step.index ?? s.length) && step.freq[ch] < k) state = 'keep'
        else if (i < (step.index ?? s.length)) state = 'drop'
        if (step.phase === 'done' && step.freq[ch] < k) state = 'keep'
        else if (step.phase === 'done') state = 'drop'
        return <li key={i} className="freq-filter__tile" data-state={state || undefined}>{ch}</li>
      })}
    </ol>
    <p className="freq-filter__output">Kept: {step.kept || '(nothing yet)'}</p>
    <p>{step.message}</p>
  </div>
}
