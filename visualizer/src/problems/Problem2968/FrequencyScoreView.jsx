import IndexedSequence from '../../components/shared/IndexedSequence'
import './FrequencyScoreView.css'

const SLOT = 44
const PLOT = 170
const TOP = 26
const BOTTOM = 42

// Sorted values as bars: the window is shaded, the median is a level line, and each move is a drawn gap to that line.
export default function FrequencyScoreView({ run, step }) {
  const { sorted, input } = run
  const { k } = input
  const { l, r, m, cost, below, above, reads } = step
  const width = sorted.length * SLOT
  const top = Math.max(...sorted)
  const low = Math.min(...sorted)
  const span = Math.max(1, top - low)
  const barHeight = value => 18 + (value - low) / span * (PLOT - 18)
  const yOf = value => TOP + PLOT - barHeight(value)
  const inWindow = i => r >= 0 && i >= l && i <= r
  const target = m === null ? null : sorted[m]
  const readSet = new Set(reads)
  const over = cost !== null && cost > k
  const ratio = cost === null ? 0 : k === 0 ? (cost > 0 ? 1 : 0) : Math.min(1, cost / k)
  return <section className="freq-score" aria-label="Sliding window over sorted values">
    <dl className="freq-score__stats">
      <div><dt>window</dt><dd>{r >= 0 ? `[${l}..${r}], length ${r - l + 1}` : 'not started'}</dd></div>
      <div><dt>target</dt><dd>{target ?? '–'}</dd></div>
      <div><dt>best</dt><dd>{step.best}</dd></div>
    </dl>
    <svg className="freq-score__bars" viewBox={`0 0 ${width} ${TOP + PLOT + BOTTOM}`} role="img" aria-label={`Sorted values with window from ${l} to ${r}`}>
      {r >= 0 && <rect x={l * SLOT} y={2} width={(r - l + 1) * SLOT} height={TOP + PLOT} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeDasharray="4 3" />}
      {sorted.map((value, i) => {
        const inside = inWindow(i)
        const dropped = step.dropped === i
        return <g key={i} data-index={i} data-in-window={inside}>
          <rect x={i * SLOT + 7} y={yOf(value)} width={SLOT - 14} height={barHeight(value)} rx={3}
            fill={dropped ? 'var(--error)' : i === m ? 'var(--primary)' : inside ? 'color-mix(in srgb, var(--primary) 45%, var(--surface2))' : 'var(--surface3)'} stroke="var(--border)" />
          <text x={i * SLOT + SLOT / 2} y={yOf(value) - 4} textAnchor="middle" fontSize={sorted.some(v => v > 99999) ? 7 : 11} fill="var(--text)">{value}</text>
          <text x={i * SLOT + SLOT / 2} y={TOP + PLOT + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">[{i}]</text>
          <text x={i * SLOT + SLOT / 2} y={TOP + PLOT + 30} textAnchor="middle" fontSize="11" fontWeight={700} fill="var(--text)">
            {[i === l && r >= 0 ? 'l' : '', i === m ? 'm' : '', i === r ? 'r' : ''].filter(Boolean).join(' ')}
          </text>
          {target !== null && inside && value !== target && <g data-gap={i}>
            <line x1={i * SLOT + SLOT / 2} x2={i * SLOT + SLOT / 2} y1={yOf(value)} y2={yOf(target)} stroke="var(--warning)" strokeWidth="3" />
            <text x={i * SLOT + SLOT / 2 + 3} y={(yOf(value) + yOf(target)) / 2 + 4} fontSize="10" fontWeight={700} fill="var(--text)">{Math.abs(value - target)}</text>
          </g>}
        </g>
      })}
      {target !== null && <line x1={l * SLOT} x2={(r + 1) * SLOT} y1={yOf(target)} y2={yOf(target)} stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 3" />}
    </svg>
    <div className="freq-score__budget" aria-label="Budget">
      <strong>Moves used: {cost ?? '–'} of {k}{over ? ', over budget' : ''}</strong>
      <div className="freq-score__track"><div className={`freq-score__fill ${over ? 'is-over' : ''}`} style={{ width: `${ratio * 100}%` }} /></div>
    </div>
    {below !== null && <p className="freq-score__formula">
      <code>below = {target} × {m - l} − (prefix[{m}] − prefix[{l}]) = {below}</code><br />
      <code>above = (prefix[{r + 1}] − prefix[{m + 1}]) − {target} × {r - m} = {above}</code>
    </p>}
    <IndexedSequence label="prefix[i], the total of the first i sorted values" length={step.prefix.length} active={step.prefixIndex ?? -1}
      valueAt={i => step.prefix[i]} roleAt={i => (readSet.has(i) ? 'read' : '')} />
  </section>
}
