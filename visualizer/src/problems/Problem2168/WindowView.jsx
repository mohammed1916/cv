import RecordStateTable from '../../components/shared/RecordStateTable'
import './WindowView.css'

// The window [l, r] is the substring under test. Its digit counts are read from the prefix table.
export default function WindowView({ run, step }) {
  const { s } = run.input
  const inWindow = i => step.l >= 0 && i >= step.l && i <= step.r
  const rows = step.counts ? step.counts.map((count, digit) => ({ digit, count })).filter(row => row.count > 0) : []
  return (
    <div className="window-view">
      <div className="digit-row" role="img" aria-label={`Digits ${s}`}>
        {s.split('').map((c, i) => <div key={i} className={`digit-cell${inWindow(i) ? ' in-window' : ''}`}>
          <small>{i}</small><strong>{c}</strong>
          {i === step.l && <span className="pointer">l</span>}
          {i === step.r && <span className="pointer">r</span>}
        </div>)}
      </div>
      {step.sub !== undefined && <p style={{ margin: 0 }}>Window <code>{step.sub}</code>: {step.ok ? 'every present digit has the same count' : 'counts differ'}</p>}
      {step.counts && <RecordStateTable label="Digit counts in the window" columns={['digit', 'count']} rows={rows} />}
      <p>Distinct qualifying substrings so far: <strong>{step.seen.length}</strong></p>
    </div>
  )
}
