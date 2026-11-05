import './RangeTrackView.css'

// Number line from low to high: the candidate is placed on it, kept answers stay as dots, and out-of-range candidates pin to an edge.
export default function RangeTrackView({ low, high, value, verdict, answer }) {
  const span = Math.max(1, high - low)
  const at = v => `${Math.min(100, Math.max(0, ((v - low) / span) * 100))}%`
  return (
    <figure className="rt-view">
      <div className="rt-track" role="img" aria-label={`Range ${low} to ${high}`}>
        <span className="rt-bound rt-bound--low" style={{ left: 0 }}>{low}</span>
        <span className="rt-bound rt-bound--high" style={{ left: '100%' }}>{high}</span>
        {answer.map(v => <span key={v} className="rt-dot rt-dot--kept" style={{ left: at(v) }} title={String(v)} />)}
        {value !== null && value !== undefined && (
          <span className={`rt-candidate rt-candidate--${verdict ?? 'pending'}`} style={{ left: value < low ? '0%' : value > high ? '100%' : at(value) }}>
            {value}{verdict === 'low' ? ' (below)' : verdict === 'high' ? ' (above)' : ''}
          </span>
        )}
      </div>
      <figcaption>Kept numbers are dots on the line. A candidate outside [{low}, {high}] is pinned to the edge it passed.</figcaption>
    </figure>
  )
}
