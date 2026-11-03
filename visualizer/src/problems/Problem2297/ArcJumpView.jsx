import './ArcJumpView.css'

const CELL = 58
const PAD = 26
const ARC_ROOM = 92

export default function ArcJumpView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="aj-view" aria-label="Jump Game VIII arcs">
        <p className="aj-empty">Press Play to watch each index collect the cheapest legal landing.</p>
      </section>
    )
  }

  const { nums, costs } = run.input
  const n = nums.length
  const dp = step.dp
  const width = PAD * 2 + n * CELL
  const height = ARC_ROOM + 3 * CELL + PAD
  const cx = i => PAD + i * CELL + CELL / 2
  const rowTop = ARC_ROOM
  const valueY = rowTop + CELL / 2 + 6
  const costY = rowTop + CELL + CELL / 2 + 6
  const dpY = rowTop + 2 * CELL + CELL / 2 + 6
  const j = step.j

  const arcs = (step.arcs || []).map(arc => {
    const span = Math.abs(cx(j) - cx(arc.from))
    const lift = Math.min(ARC_ROOM - 10, 18 + span * 0.6)
    const mid = (cx(j) + cx(arc.from)) / 2
    return { ...arc, d: `M ${cx(arc.from)} ${rowTop - 6} Q ${mid} ${rowTop - 6 - lift * 2} ${cx(j)} ${rowTop - 6}` }
  })

  const stackLabel = list => (list.length ? list.map(i => `${i}(${nums[i]})`).join(' → ') : 'empty')

  return (
    <section className="aj-view" aria-label="Jump Game VIII arcs">
      <header className="aj-header">
        <h3 className="aj-title">{step.phase === 'done' ? 'Answer ready' : `Landing on index ${j}`}</h3>
        <p className="aj-status" role="status">
          {step.best !== null && step.best !== undefined && step.phase !== 'scan'
            ? `Cheapest source ${step.bestFrom} with dp ${step.best}${step.bestKind ? ` (${step.bestKind === 'peak' ? 'rising jump' : 'falling jump'})` : ''}`
            : 'Checking the stacks'}
        </p>
      </header>

      <div className="aj-stage">
        <svg className="aj-svg" viewBox={`0 0 ${width} ${height}`} role="img"
          aria-label={`Row of ${n} indices. ${step.message}`}>
          <defs>
            <marker id="aj-head-peak" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" className="aj-head aj-head--peak" />
            </marker>
            <marker id="aj-head-valley" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" className="aj-head aj-head--valley" />
            </marker>
          </defs>

          {arcs.map(arc => (
            <path key={`${arc.from}-${arc.kind}`} d={arc.d} className={`aj-arc aj-arc--${arc.kind}`}
              markerEnd={`url(#aj-head-${arc.kind})`} />
          ))}

          {Array.from({ length: n }, (_, i) => {
            const classes = ['aj-cell']
            if (i === j) classes.push('aj-cell--current')
            if (i === step.bestFrom) classes.push('aj-cell--source')
            if ((step.arcs || []).some(a => a.from === i)) classes.push('aj-cell--seen')
            if (step.phase === 'done' && i === n - 1) classes.push('aj-cell--answer')
            if (step.peaks?.includes(i)) classes.push('aj-cell--peak')
            if (step.valleys?.includes(i)) classes.push('aj-cell--valley')
            const value = dp[i] === null || dp[i] === undefined ? '-' : dp[i]
            return (
              <g key={i} className={classes.join(' ')}
                aria-label={`Index ${i}, value ${nums[i]}, cost ${costs[i]}, dp ${value}${i === j ? ', current' : ''}${i === step.bestFrom ? ', cheapest source' : ''}`}>
                <rect x={PAD + i * CELL + 4} y={rowTop + 4} width={CELL - 8} height={CELL - 8} rx={8} />
                <text x={cx(i)} y={valueY} textAnchor="middle" className="aj-value">{nums[i]}</text>
                <text x={cx(i)} y={costY} textAnchor="middle" className="aj-cost">{`c${costs[i]}`}</text>
                <text x={cx(i)} y={dpY} textAnchor="middle" className="aj-dp">{value}</text>
                <text x={cx(i)} y={height - 4} textAnchor="middle" className="aj-index">{i}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <dl className="aj-stacks">
        <div><dt>Peaks (rising source stack)</dt><dd>{stackLabel(step.peaks || [])}</dd></div>
        <div><dt>Valleys (falling source stack)</dt><dd>{stackLabel(step.valleys || [])}</dd></div>
      </dl>

      <p className="aj-message" role="note">{step.message}</p>
      <ul className="aj-legend" aria-label="Legend">
        <li><span className="aj-swatch aj-swatch--peak" /> rising jump: nums[i] at most nums[j]</li>
        <li><span className="aj-swatch aj-swatch--valley" /> falling jump: nums[i] above nums[j]</li>
        <li><span className="aj-swatch aj-swatch--current" /> index being landed on</li>
        <li><span className="aj-swatch aj-swatch--source" /> cheapest source found so far</li>
      </ul>
    </section>
  )
}
