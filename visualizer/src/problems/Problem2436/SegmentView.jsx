import './SegmentView.css'

export default function SegmentView({ run, step }) {
  if (!run || !step) return null
  const nums = run.input
  const { segments, current, candidate, phase } = step
  const segmentOf = i => segments.findIndex(s => i >= s.start && i <= s.end)

  return (
    <div className="segment-view">
      <div className="segment-view__row" role="list" aria-label="Array elements grouped into subarrays">
        {nums.map((value, i) => {
          const seg = segmentOf(i)
          const cls = [
            'segment-view__cell',
            seg >= 0 ? `is-seg-${seg % 4}` : 'is-unvisited',
            i === current ? 'is-current' : '',
            segments.some(s => s.start === i) && i > 0 ? 'is-cut' : '',
          ].join(' ')
          return (
            <div key={i} role="listitem" className={cls}>
              <span className="segment-view__index">{i}</span>
              <strong>{value}</strong>
            </div>
          )
        })}
      </div>
      <div className="segment-view__bands" aria-hidden="true">
        {segments.map((s, k) => (
          <div key={k} className={`segment-view__band is-seg-${k % 4}`} style={{ gridColumn: `${s.start + 1} / ${s.end + 2}` }}>
            {`subarray ${k + 1} · gcd ${s.gcd}`}
          </div>
        ))}
      </div>
      <p className="segment-view__note" aria-live="polite">
        {candidate !== null && candidate !== undefined && current >= 0
          ? `Index ${current}: gcd is ${candidate}. ${phase === 'cut' ? 'Start a new subarray here.' : 'Keep extending.'}`
          : phase === 'impossible' ? 'A value of 1 cannot sit in any valid subarray.' : `Subarrays so far: ${step.count}`}
      </p>
      <output aria-label="Subarray count">{`Count: ${step.count}`}</output>
    </div>
  )
}
