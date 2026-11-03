import './GenerationView.css'

const chip = (key, cls, goal) => {
  const isGoal = key === goal
  return (
    <li key={key} className={`generation__chip ${cls}${isGoal ? ' is-target' : ''}`}>
      ({key.split(',').join(', ')}){isGoal ? ' target' : ''}
    </li>
  )
}

export default function GenerationView({ step }) {
  const freshSet = new Set(step.fresh)
  const known = step.pool.filter(k => !freshSet.has(k))
  return (
    <section className="generation" aria-label="Generations of triples">
      <h3 className="generation__title">Generation {step.generation}</h3>
      <p role="status">{step.message}</p>
      <div className="generation__group">
        <h4>Known before this generation ({known.length})</h4>
        <ul>{known.map(k => chip(k, 'is-known', step.target))}</ul>
      </div>
      <div className="generation__group">
        <h4>Midpoints produced ({step.produced.length}), new ones marked</h4>
        <ul>{step.produced.map(k => chip(k, freshSet.has(k) ? 'is-new' : 'is-repeat', step.target))}</ul>
      </div>
      <p className="generation__note">Midpoints use floor((p + q) / 2) per coordinate. Pairs come from triples known before this generation.</p>
    </section>
  )
}
