import './LcpRemovalView.css'

// Two letter rows. The removed letter of first is struck through; the shared prefix is green; the candidate run after the gap is blue.
export default function LcpRemovalView({ run, step }) {
  if (!run || !step) return <section className="lcp-view"><p className="lcp-empty">Press Play to step through the removal.</p></section>
  const { first, second } = run.input
  const { removed, reach, pre, best } = step
  const firstCells = [...first]
  const secondCells = [...second]
  const alignedLength = Math.max(firstCells.length, secondCells.length)
  // Column q compares second[q] with first[q] before the gap and with first[q + 1] after it.
  const firstIndexFor = q => (removed >= 0 && q >= removed ? q + 1 : q)
  return (
    <section className="lcp-view" aria-label="Longest common prefix after one removal">
      <div className="lcp-row">
        <span className="lcp-label">first</span>
        <div className="lcp-tiles">
          {firstCells.map((ch, i) => (
            <span key={`f${i}`} className={`lcp-tile${i === removed ? ' lcp-tile--removed' : ''}${i < pre && removed < 0 ? ' lcp-tile--shared' : ''}`}>
              {ch}
              <small>{i}</small>
            </span>
          ))}
        </div>
      </div>
      <div className="lcp-row">
        <span className="lcp-label">second</span>
        <div className="lcp-tiles">
          {secondCells.map((ch, i) => (
            <span key={`s${i}`} className={`lcp-tile lcp-tile--second${i < reach ? ' lcp-tile--reached' : ''}`}>
              {ch}
              <small>{i}</small>
            </span>
          ))}
        </div>
      </div>
      <div className="lcp-aligned" aria-label="Aligned comparison">
        {Array.from({ length: Math.min(alignedLength, secondCells.length) }, (_, q) => {
          const fi = firstIndexFor(q)
          const fch = firstCells[fi]
          const same = fch !== undefined && fch === secondCells[q]
          const cls = q < reach ? 'lcp-pair--reached' : q === reach && step.match === false ? 'lcp-pair--stop' : 'lcp-pair--idle'
          return <span key={q} className={`lcp-pair ${cls}`}>{fch ?? '-'}{same ? '=' : '≠'}{secondCells[q]}</span>
        })}
      </div>
      <p className="lcp-summary">
        {removed >= 0 ? `Removed index ${removed}. ` : 'No removal yet. '}
        Reached length {reach}. Best so far {best}.
      </p>
    </section>
  )
}
