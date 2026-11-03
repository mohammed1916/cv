import './ArrivalLineView.css'

// Arrivals are cards in line order. The selected card is filled, the card being
// compared is outlined, and a card that just took over is darker.
export default function ArrivalLineView({ run, step }) {
  return <div className="arrival-line" style={{ '--accent': '#0f766e' }}>
    <ol className="arrival-line__row" aria-label="Arrivals in order">
      {run.input.map((rank, i) => {
        let role = i === step.index ? 'current' : ''
        if (i === step.index && step.phase === 'replace') role = 'replaced'
        else if (rank === step.selected && i <= step.index && !role) role = 'selected'
        return <li key={i} className="arrival-line__card" data-role={role || undefined}>
          <span>arrival {i}</span>
          <strong>{rank}</strong>
        </li>
      })}
    </ol>
    <p className="arrival-line__count">Selected rank: {step.selected} · Replacements: {step.count}</p>
  </div>
}
