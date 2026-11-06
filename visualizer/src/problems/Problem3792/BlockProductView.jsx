import './BlockProductView.css'

const HUES = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--error)', 'var(--info)', 'var(--primary)', 'var(--success)', 'var(--error)']

export default function BlockProductView({ run, step }) {
  if (!run || !step) return <p className="bp-empty">Press Play to build the blocks one by one.</p>
  const { n } = run.input
  const finished = step.blocks
  const upcoming = Array.from({ length: n - finished.length }, (_, i) => finished.length + i + 1)
  return (
    <section className="bp" aria-label="Increasing product blocks">
      <div className="bp-row">
        {finished.map((b, idx) => (
          <article key={b.k} className={`bp-block${idx === step.activeBlock ? ' bp-block--active' : ''}`} style={{ '--hue': HUES[idx % HUES.length] }}>
            <header>Block {b.k}</header>
            <div className="bp-values">
              {b.values.map(x => <span key={x} className="bp-value">{x}</span>)}
            </div>
            <footer>product {b.product}</footer>
          </article>
        ))}
        {upcoming.map(k => (
          <article key={`u${k}`} className="bp-block bp-block--upcoming">
            <header>Block {k}</header>
            <div className="bp-values">
              {Array.from({ length: k }, (_, t) => <span key={t} className="bp-value">?</span>)}
            </div>
          </article>
        ))}
      </div>
      {step.phase === 'multiply' ? (
        <p className="bp-live">Multiplying in {step.reading}: partial product {step.partial}</p>
      ) : null}
      <output className="bp-total">Running total mod 1000000007: {step.total}</output>
      <p className="bp-message">{step.message}</p>
    </section>
  )
}
