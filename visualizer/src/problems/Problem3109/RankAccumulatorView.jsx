import './RankAccumulatorView.css'

export default function RankAccumulatorView({ run, step }) {
  const perm = run.input
  const n = perm.length
  const unused = new Set(step.unused)
  const current = step.i
  return (
    <div className="rav">
      <section aria-label="Permutation">
        <h3 className="rav__title">Permutation</h3>
        <ol className="rav__row">
          {perm.map((v, i) => {
            const done = i < current || (step.phase === 'done')
            const active = i === current
            return (
              <li key={i} className={`rav__cell${active ? ' is-current' : ''}${done ? ' is-done' : ''}`}>
                <span className="rav__pos">{i}</span>
                <span className="rav__val">{v}</span>
              </li>
            )
          })}
        </ol>
      </section>
      <section aria-label="Unused values">
        <h3 className="rav__title">Unused values</h3>
        <ol className="rav__row">
          {Array.from({ length: n }, (_, k) => k + 1).map(v => (
            <li key={v} className={`rav__pool${unused.has(v) ? ' is-free' : ''}${step.value === v ? ' is-picked' : ''}`}>{unused.has(v) ? v : '-'}</li>
          ))}
        </ol>
      </section>
      <dl className="rav__facts">
        <div><dt>value at position</dt><dd>{step.value ?? '-'}</dd></div>
        <div><dt>smaller unused</dt><dd>{step.smaller ?? '-'}</dd></div>
        <div><dt>weight (remaining)!</dt><dd>{step.weight ?? '-'}</dd></div>
        <div><dt>rank so far</dt><dd>{step.rank}</dd></div>
      </dl>
      <p className="rav__note" role="status">{step.message}</p>
    </div>
  )
}
