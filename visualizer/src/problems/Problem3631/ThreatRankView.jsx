import './ThreatRankView.css'

// The sorted prefix is a lane of cards ordered by score, highest first. The threat being
// placed is outlined solidly, and the threat it is compared against is outlined dashed.
export default function ThreatRankView({ run, step }) {
  const byId = new Map(run.input.map(t => [t[0], t]))
  const score = t => 2 * t[1] + t[2]
  return <div className="threat-rank" style={{ '--accent': '#b91c1c' }}>
    <p className="threat-rank__label">Sorted by score: higher first, then smaller id.</p>
    <ol className="threat-rank__lane" aria-label="Threat order">
      {step.order.map(id => {
        const t = byId.get(id)
        let role = ''
        if (id === step.current) role = 'current'
        else if (id === step.compare) role = 'compare'
        return <li key={id} className="threat-rank__card" data-role={role || undefined}>
          <strong>id {id}</strong>
          <span>severity {t[1]} · exploit {t[2]}</span>
          <span>score {score(t)}</span>
        </li>
      })}
    </ol>
    <p className="threat-rank__label">{step.message}</p>
  </div>
}
