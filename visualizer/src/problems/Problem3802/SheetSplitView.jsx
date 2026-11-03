import './SheetSplitView.css'

function Row({ title, first, second, firstLimit, secondLimit, firstName, secondName, verdict }) {
  const cells = []
  for (let i = 0; i < first; i++) cells.push(<span key={`a${i}`} className="ss-sheet ss-sheet--a">{firstName}</span>)
  for (let i = 0; i < second; i++) cells.push(<span key={`b${i}`} className="ss-sheet ss-sheet--b">{secondName}</span>)
  return (
    <div className="ss-row">
      <h3>{title}</h3>
      <div className="ss-sheets">{cells.length ? cells : <span className="ss-muted">no split yet</span>}</div>
      <p className="ss-count">
        {firstName}: {first} of at most {firstLimit} &middot; {secondName}: {second} of at most {secondLimit}
        {verdict === null || verdict === undefined ? '' : verdict ? ' - fits' : ' - over a limit'}
      </p>
    </div>
  )
}

export default function SheetSplitView({ run, step }) {
  if (!run || !step) return <p className="ss-empty">Press Play to test each split of the sheets.</p>
  const { n, limitA, limitB } = run.input
  const x = step.x
  const y = step.y ?? 0
  const showSplit = x >= 1 && x <= n - 1
  return (
    <section className="ss" aria-label="Sheet splits and colour limits">
      <p className="ss-summary">{n} sheets, colour A covers at most {limitA}, colour B at most {limitB}. Running total: {step.total}.</p>
      {showSplit ? <>
        <Row title="Colour A first" first={x} second={y} firstLimit={limitA} secondLimit={limitB} firstName="A" secondName="B"
          verdict={step.phase === 'checkA' || step.phase === 'checkB' ? step.aFirst : null} />
        <Row title="Colour B first" first={x} second={y} firstLimit={limitB} secondLimit={limitA} firstName="B" secondName="A"
          verdict={step.phase === 'checkB' ? step.bFirst : null} />
      </> : null}
      <p className="ss-message">{step.message}</p>
    </section>
  )
}
