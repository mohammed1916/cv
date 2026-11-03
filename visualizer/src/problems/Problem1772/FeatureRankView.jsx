import './FeatureRankView.css'

// Each feature is a bar whose length is its response count. The response being read lists its distinct words.
export default function FeatureRankView({ run, step }) {
  const { features, responses } = run.input
  const reading = step.ri >= 0 && step.ri < responses.length
  const maxCount = Math.max(1, ...features.map(f => step.counts[f] ?? 0))
  const rows = step.placed.length ? step.placed : features
  return (
    <div className="feature-rank">
      <div className="feature-rank__response" aria-live="polite">
        {reading
          ? <>
              <span className="feature-rank__label">Response {step.ri + 1}:</span>
              {step.words.map(w => <span key={w} className={`feature-rank__word ${features.includes(w) ? 'is-feature' : ''}`}>{w}</span>)}
            </>
          : step.phase === 'sort' || step.phase === 'done' ? 'All responses counted' : 'Waiting for responses'}
      </div>
      <ul className="feature-rank__list" aria-label="Feature counts">
        {features.map((f, i) => {
          const count = step.counts[f] ?? 0
          const isCurrent = step.fi === i && step.phase !== 'sort' && step.phase !== 'done'
          const hit = isCurrent && step.hit
          return (
            <li key={f} className={`feature-rank__row ${isCurrent ? 'is-current' : ''} ${hit ? 'is-hit' : ''}`}>
              <span className="feature-rank__name">{f}</span>
              <span className="feature-rank__bar" aria-hidden="true"><span style={{ width: `${(count / maxCount) * 100}%` }} /></span>
              <span className="feature-rank__count">{count}{hit ? ' +1' : ''}</span>
            </li>
          )
        })}
      </ul>
      <ol className="feature-rank__ranking" aria-label="Ranking so far">
        {step.placed.length ? step.placed.map((f, i) => <li key={`${f}-${i}`}>{f} <small>({step.counts[f]})</small></li>) : <li className="is-empty">Ranking appears after counting</li>}
      </ol>
      <p className="feature-rank__legend">Bars show response counts. Ties keep the feature's original position: {rows.join(', ')}.</p>
    </div>
  )
}
