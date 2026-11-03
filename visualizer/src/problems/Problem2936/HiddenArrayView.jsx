import './HiddenArrayView.css'

export default function HiddenArrayView({ run, step }) {
  const { values } = run.input
  const known = new Map((step.revealed ?? []).map(r => [r.index, r.value]))
  const lastRead = step.phase === 'probe' ? step.mid : step.phase === 'read' ? step.start : null
  return (
    <div className="hidden-array-view">
      <p className="hidden-rule">The array is hidden. Only at(index) reveals one entry, so the search asks about a few positions instead of reading everything.</p>
      <ol className="hidden-strip" aria-label="Hidden array positions">
        {values.map((_, i) => {
          const classes = ['hidden-cell']
          if (known.has(i)) classes.push('is-known')
          if (i === lastRead) classes.push('is-probe')
          if (i === step.start && step.phase !== 'done') classes.push('is-start')
          if (step.lo !== null && step.hi !== null && i >= step.lo && i < step.hi) classes.push('is-range')
          if (i < step.blocks && step.blocks > 0 && i === step.start) classes.push('is-boundary')
          return (
            <li key={i} className={classes.join(' ')}>
              <span className="hidden-index">{i}</span>
              <strong className="hidden-value">{known.has(i) ? known.get(i) : '?'}</strong>
            </li>
          )
        })}
      </ol>
      <dl className="hidden-facts">
        <div><dt>Blocks found</dt><dd>{step.blocks}</dd></div>
        <div><dt>Block value</dt><dd>{step.value ?? 'none'}</dd></div>
        <div><dt>Search range</dt><dd>{step.lo === null ? 'none' : `${step.lo} to ${step.hi - 1}`}</dd></div>
        <div><dt>at() calls</dt><dd>{step.revealed.length} distinct</dd></div>
      </dl>
      <output className="hidden-message" aria-label="Search status">{step.message}</output>
    </div>
  )
}
