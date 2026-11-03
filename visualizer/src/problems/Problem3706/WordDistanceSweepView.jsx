import './WordDistanceSweepView.css'

const TILE = 58

// A single sweep: j moves left to right. The reference line marks the first word unlike words[0];
// the arc from the partner to j shows the pair being measured.
export default function WordDistanceSweepView({ run, step }) {
  if (!run || !step) return <section className="wds-view"><p className="wds-empty">Press Play to sweep j across the words.</p></section>
  const words = run.input
  const n = words.length
  const partner = step.partner
  const j = step.j
  const first = step.first
  const span = partner !== null && j >= 0 ? (j - partner) * TILE : 0
  return (
    <section className="wds-view" aria-label="Single sweep over words">
      <div className="wds-track" style={{ width: n * TILE }}>
        {first !== null ? <div className="wds-reference" style={{ left: first * TILE + TILE / 2 }}><span>first unlike</span></div> : null}
        {partner !== null && j >= 0 ? (
          <div className="wds-arc" style={{ left: partner * TILE + TILE / 2, width: span }}>
            <span>{`j - i = ${j - partner}`}</span>
          </div>
        ) : null}
        {words.map((word, index) => {
          const classes = ['wds-tile']
          if (index === 0) classes.push('wds-tile--ref')
          if (index === j) classes.push('wds-tile--j')
          if (index === partner) classes.push('wds-tile--partner')
          return (
            <div key={index} className={classes.join(' ')} style={{ left: index * TILE }}>
              <span className="wds-word">{word}</span>
              <span className="wds-index">{index}</span>
            </div>
          )
        })}
      </div>
      <div className="wds-readout">
        <span>{j >= 0 ? `j = ${j}` : 'j not started'}</span>
        <span>{partner !== null && j >= 0 ? `partner i = ${partner}` : 'no partner yet'}</span>
        <span className="wds-best">{`best ${step.best}`}</span>
      </div>
      <p className="wds-key">Blue: words[0], the reference. Amber: j. Green: chosen partner i. Arc: the distance measured at j.</p>
    </section>
  )
}
