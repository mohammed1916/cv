import './HeroSearchView.css'

// Monsters sorted by strength form a row. The hero's strength is a marker; the search window narrows around the cut.
export default function HeroSearchView({ run, step }) {
  const { heroes } = run.input
  const sorted = step.sorted
  const h = step.hero >= 0 ? heroes[step.hero] : null
  return <div className="hero-search">
    <div className="hero-search__row" role="list" aria-label="Monsters sorted by strength">
      {sorted.map(([s, c], j) => {
        const classes = ['hero-search__monster']
        if (step.phase === 'search' && step.lo >= 0 && j >= step.lo && j < step.hi) classes.push('is-window')
        if (j === step.mid) classes.push('is-mid')
        if (step.phase === 'answer' || (h !== null && s <= h && step.phase !== 'sort' && step.phase !== 'prefix')) {
          if (h !== null && s <= h) classes.push('is-beaten')
        }
        return <div key={j} role="listitem" className={classes.join(' ')} aria-label={`monster ${j} strength ${s} coins ${c}`}>
          <strong>{s}</strong><span>{c} coins</span><small>{j}</small>
        </div>
      })}
    </div>
    {h !== null && <p className="hero-search__hero">Hero strength <b>{h}</b> beats every monster with strength up to {h}.</p>}
    {(step.phase === 'prefix' || step.phase === 'search' || step.phase === 'answer' || step.phase === 'done') &&
      <div className="hero-search__prefix" aria-label="Prefix sums of coins">
        <span>Prefix:</span>{step.prefix.map((v, j) => <b key={j} className={step.lo === j && step.hero >= 0 ? 'is-cut' : ''}>{v}</b>)}
      </div>}
    <p className="hero-search__legend">Teal monsters are beatable by the current hero. The purple position is the midpoint being checked; the dashed window is the search range.</p>
    <output aria-label="Totals so far">{`hero ${step.hero >= 0 ? step.hero + 1 : '-'} of ${heroes.length} · totals ${step.answers.join(', ') || 'none yet'}`}</output>
  </div>
}
