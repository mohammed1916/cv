const TONE = { merged: 'var(--success)', redundant: 'var(--text-muted)', removed: 'var(--error)', active: 'var(--primary)', waiting: 'var(--border)' }
const NOTE = { merged: 'merged', redundant: 'redundant', removed: 'removed', active: 'now', waiting: '' }

// Edges in the order they are tried, the component count against k, and the cost of each current component.
export default function ComponentLedger({ step }) {
  const total = step.components.reduce((sum, component) => sum + component.members.length, 0)
  return <section aria-label="Edge ledger and component count" style={{ display: 'grid', gap: 10, color: 'var(--text)' }}>
    <div>
      <strong>{step.sorted ? 'Edges, lightest first' : 'Edges, not yet needed'}</strong>
      <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '4px 0 0' }}>
        {step.ledger.map(entry => <li key={entry.index} data-edge={entry.index} data-status={entry.status} style={{
          border: `2px solid ${TONE[entry.status]}`, borderRadius: 6, padding: '2px 8px', textAlign: 'center', minWidth: 54, background: 'var(--surface2)',
          opacity: entry.status === 'removed' || entry.status === 'redundant' ? 0.7 : 1,
          textDecoration: entry.status === 'removed' ? 'line-through' : 'none',
        }}>
          <b style={{ display: 'block' }}>{entry.w}</b>
          <small style={{ display: 'block' }}>{entry.u}-{entry.v}</small>
          <small style={{ display: 'block', minHeight: 14, color: 'var(--text-muted)' }}>{NOTE[entry.status]}</small>
        </li>)}
      </ol>
    </div>
    <div>
      <strong>{step.count} component{step.count === 1 ? '' : 's'}, limit {step.k}</strong>
      <div role="img" aria-label={`${step.count} components with a limit of ${step.k}`} style={{ display: 'flex', gap: 3, marginTop: 4 }}>
        {Array.from({ length: total }, (_, i) => <span key={i} data-pip={i < step.count ? 'on' : 'off'} style={{
          width: 18, height: 18, borderRadius: 4, border: `2px solid ${i === step.k - 1 ? 'var(--primary)' : 'var(--border)'}`,
          background: i < step.count ? (i < step.k ? 'var(--success)' : 'var(--error)') : 'transparent',
        }} />)}
      </div>
    </div>
    <div>
      <strong>Components and their cost</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {step.components.map(component => {
          const highest = step.answer !== null && component.cost === step.answer
          return <span key={component.members[0]} data-cost={component.cost} style={{ border: `2px solid ${highest ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 6, padding: '2px 8px', background: 'var(--surface2)' }}>
            {`{${component.members.join(', ')}}`} costs <b>{component.cost}</b>
          </span>
        })}
      </div>
    </div>
    {step.answer !== null && <output aria-label="Answer" style={{ fontWeight: 700 }}>Minimum possible largest cost: {step.answer}</output>}
  </section>
}
