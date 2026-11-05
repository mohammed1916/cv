import './EncodingPointerView.css'

// Both encodings as tiles with their pointers i and j, digit runs grouped as one wildcard block,
// and a difference meter: right of centre means s1 has wildcards pending, left means s2 does.
export default function EncodingPointerView({ s1, s2, i, j, d }) {
  const tiles = (s, at, label) => (
    <div className="ep-row" aria-label={label}>
      <span className="ep-label">{label}</span>
      <div className="ep-tiles">
        {[...s].map((ch, k) => {
          const pointer = k === at ? ' ep-tile--at' : ''
          const wild = /\d/.test(ch) ? ' ep-tile--wild' : ''
          return (
            <span key={k} className={`ep-tile${pointer}${wild}`}>
              <small>{at === k ? (label === 's1' ? 'i' : 'j') : ' '}</small>
              {ch}
            </span>
          )
        })}
        <span className={`ep-tile ep-tile--end${at === s.length ? ' ep-tile--at' : ''}`}><small>{at === s.length ? (label === 's1' ? 'i' : 'j') : ' '}</small>end</span>
      </div>
    </div>
  )
  const clamp = Math.max(-6, Math.min(6, d ?? 0))
  const left = clamp < 0 ? `${50 + (clamp / 6) * 50}%` : '50%'
  const width = `${(Math.abs(clamp) / 6) * 50}%`
  return (
    <figure className="ep-view">
      {tiles(s1, i, 's1')}
      {tiles(s2, j, 's2')}
      <div className="ep-meter" aria-label={`pending difference ${d ?? 0}`}>
        <span className="ep-axis" />
        <span className={`ep-fill${clamp > 0 ? ' ep-fill--s1' : clamp < 0 ? ' ep-fill--s2' : ''}`} style={{ left, width }} />
        <span className="ep-mid">0</span>
      </div>
      <figcaption>
        Pending difference d = {d ?? 0}. Right of 0: s1 has {Math.max(0, d ?? 0)} wildcard character(s) that s2 must cover. Left of 0: s2 has {Math.max(0, -(d ?? 0))} that s1 must cover.
      </figcaption>
    </figure>
  )
}
