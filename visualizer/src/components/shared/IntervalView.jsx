import { intervalTrackLayout } from './intervalModel.js'
import './IntervalView.css'

const LEGEND = [
  ['current', 'being examined'], ['merged', 'merged / result'], ['kept', 'kept'], ['rejected', 'rejected / removed'], ['active', 'active at sweep'], ['pending', 'not yet processed'],
]

/**
 * Intervals as bars on a shared number line (one track per group, overlaps stacked in lanes), an optional
 * sweep marker, and an optional event list with the running count. Build the props with `intervalView(...)`.
 */
export default function IntervalView({ title = 'Intervals', intervals, marker = null, markerLabel = '', events = null, closed = false, note = '' }) {
  const { tracks, ticks, markerLeft } = intervalTrackLayout(intervals, { marker, closed })
  const used = new Set(intervals.map(i => i.role ?? 'pending'))
  return <section className="interval-view" aria-label={title}>
    <h3>{title}</h3>
    {note && <p className="interval-view__note">{note}</p>}
    <div className="interval-view__tracks">
      {tracks.map(track => <div key={track.group} className="interval-view__track">
        {track.group && <span className="interval-view__group">{track.group}</span>}
        <div className="interval-view__lanes" style={{ height: `${track.lanes * 26 + 4}px` }}>
          {ticks.map(t => <i key={t.value} className="interval-view__gridline" style={{ left: `${t.left}%` }} />)}
          {markerLeft !== null && <i className="interval-view__marker" style={{ left: `${markerLeft}%` }} />}
          {track.bars.map((bar, i) => <span key={i} className={`interval-view__bar is-${bar.role}`}
            title={`${closed ? '[' : '['}${bar.start}, ${bar.end}${closed ? ']' : ')'} ${bar.role}`}
            style={{ left: `${bar.left}%`, width: `${bar.width}%`, top: `${bar.lane * 26 + 2}px` }}>
            <b>{bar.label ?? `${bar.start}–${bar.end}`}</b>
          </span>)}
        </div>
      </div>)}
      <div className="interval-view__axis" aria-hidden="true">
        {ticks.map(t => <span key={t.value} style={{ left: `${t.left}%` }}>{t.value}</span>)}
        {markerLeft !== null && <span className="interval-view__marker-label" style={{ left: `${markerLeft}%` }}>{markerLabel || marker}</span>}
      </div>
    </div>
    {events && events.length > 0 && <table className="interval-view__events" aria-label="Sweep events">
      <thead><tr><th>Position</th><th>Event</th><th>Change</th><th>Running count</th></tr></thead>
      <tbody>{events.map((row, i) => <tr key={i} className={`is-${row.state}${row.isPeak ? ' is-peak' : ''}`}>
        <td>{row.pos}</td><td>{row.label ?? (row.delta > 0 ? 'start' : 'end')}</td>
        <td>{row.delta > 0 ? `+${row.delta}` : row.delta}</td>
        <td>{row.state === 'pending' ? '·' : row.running}{row.isPeak ? ' (peak)' : ''}</td>
      </tr>)}</tbody>
    </table>}
    <p className="interval-view__legend">{LEGEND.filter(([role]) => used.has(role)).map(([role, text]) => <span key={role} className={`is-${role}`}>{text}</span>)}</p>
  </section>
}
