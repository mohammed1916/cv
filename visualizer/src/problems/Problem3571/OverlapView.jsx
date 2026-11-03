import './OverlapView.css'

export default function OverlapView({ run, step }) {
  const { first, second } = run.input
  const shown = step.text || ''
  const x = step.x || ''
  const y = step.y || ''
  const k = step.k
  const yStart = x.length - (k > 0 ? k : 0)
  const cells = [...shown].map((ch, i) => {
    const inX = i < x.length
    const inY = y.length > 0 && i >= yStart && i < yStart + y.length
    const shared = inX && inY && k > 0
    const cls = ['letter', shared ? 'letter--shared' : inX ? 'letter--first' : 'letter--second'].join(' ')
    return <span key={i} className={cls}>{ch}</span>
  })
  return (
    <figure className="overlap-view">
      <div className="overlap-view__words" aria-label="Input words">
        <span className="word word--first">{`first: ${first}`}</span>
        <span className="word word--second">{`second: ${second}`}</span>
      </div>
      <div className="overlap-view__strip" role="img" aria-label={shown ? `Candidate ${shown}` : 'No candidate yet'}>
        {cells.length ? cells : <span className="overlap-view__empty">Candidates appear here as overlaps are tried.</span>}
      </div>
      <p className="overlap-view__key">Blue: from the leading word. Green: from the trailing word. Amber: shared overlap.</p>
      <ul className="overlap-view__list" aria-label="Candidates tried">
        {step.candidates.map((c, i) => (
          <li key={i}>{`${c.x} + ${c.y} with overlap ${c.k}: ${c.text}`}</li>
        ))}
      </ul>
    </figure>
  )
}
