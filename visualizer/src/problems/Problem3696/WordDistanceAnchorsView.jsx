import './WordDistanceAnchorsView.css'

const TILE = 76

// Word tiles in a row. The two anchors are the first and last word; the scan marker walks inward from
// the far end and then from the start; the bracket joins the pair that currently holds the best distance.
export default function WordDistanceAnchorsView({ run, step }) {
  if (!run || !step) return <section className="wda-view"><p className="wda-empty">Press Play to scan from both anchors.</p></section>
  const words = run.input
  const n = words.length
  const pair = step.pair
  const width = n * TILE
  return (
    <section className="wda-view" aria-label="Anchor scans over words">
      <div className="wda-track" style={{ width }}>
        {pair ? (
          <div className="wda-bracket" style={{ left: pair[0] * TILE + 6, width: (pair[1] - pair[0]) * TILE + TILE - 12 }}>
            <span>{`distance ${pair[1] - pair[0]}`}</span>
          </div>
        ) : null}
        {words.map((word, index) => {
          const classes = ['wda-tile']
          if (index === 0) classes.push('wda-tile--anchor')
          if (index === n - 1) classes.push('wda-tile--anchor-end')
          if (step.scan === index) classes.push(step.found ? 'wda-tile--hit' : 'wda-tile--scan')
          return (
            <div key={index} className={classes.join(' ')} style={{ left: index * TILE }}>
              <span className="wda-word">{word}</span>
              <span className="wda-index">{index}</span>
            </div>
          )
        })}
      </div>
      <div className="wda-legend">
        <span>{`Anchors: words[0] = "${words[0]}", words[${n - 1}] = "${words[n - 1]}"`}</span>
        <span>{`Best so far: ${step.best}`}</span>
      </div>
      <p className="wda-key">Blue: anchor word. Amber: scan position. Green: the scan found an unlike word. Bracket: best pair.</p>
    </section>
  )
}
