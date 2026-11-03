import './KFreeView.css'

const STEP = 26
const LEFT = 30
const LINE_Y = 170

export default function KFreeView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="kf-view" aria-label="K-free subsets">
        <p className="kf-empty">Press Play to walk the chains of values spaced k apart.</p>
      </section>
    )
  }

  const { sorted, k, chains, total } = step
  const maxValue = Math.max(4, ...sorted) + 1
  const x = v => LEFT + v * STEP
  const width = x(maxValue) + LEFT
  const members = new Set(step.current?.members ?? [])
  const chainOf = new Set(chains.flatMap(c => c.values))
  const present = new Set(sorted)
  const conflicts = sorted.filter(v => present.has(v + k))

  return (
    <section className="kf-view" aria-label="K-free subsets number line">
      <svg className="kf-svg" viewBox={`0 0 ${width} 230`} role="img"
        aria-label={`Values on a number line; conflicts join values ${k} apart`}>
        <line x1={LEFT} x2={x(maxValue)} y1={LINE_Y} y2={LINE_Y} className="kf-axis" />
        {conflicts.map(v => {
          const x1 = x(v)
          const x2 = x(v + k)
          const mid = (x1 + x2) / 2
          const span = (x2 - x1) / 2
          const active = members.has(v) && members.has(v + k)
          return (
            <g key={`c-${v}`} className={active ? 'kf-conflict kf-conflict--active' : 'kf-conflict'}>
              <path d={`M ${x1} ${LINE_Y - 14} Q ${mid} ${LINE_Y - 14 - span * 1.2} ${x2} ${LINE_Y - 14}`} />
              <text x={mid} y={LINE_Y - 14 - span * 0.6 - 4} textAnchor="middle">{`${v} & ${v + k}`}</text>
            </g>
          )
        })}
        {sorted.map(v => {
          const isChain = chainOf.has(v)
          const isCurrent = members.has(v) || step.value === v
          const cls = ['kf-node', isCurrent ? 'kf-node--current' : '', isChain && !isCurrent ? 'kf-node--done' : '',
            present.has(v - k) ? 'kf-node--follower' : ''].filter(Boolean).join(' ')
          return (
            <g key={v} className={cls}>
              <circle cx={x(v)} cy={LINE_Y} r="11" />
              <text x={x(v)} y={LINE_Y + 4} textAnchor="middle">{v}</text>
              <text x={x(v)} y={LINE_Y + 28} textAnchor="middle" className="kf-tag">
                {present.has(v - k) ? 'inside chain' : 'start'}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="kf-counters" role="status">
        {step.current
          ? <p>{`Current chain counts: skip ${step.current.skip}, take ${step.current.take}, ways ${step.current.skip + step.current.take}.`}</p>
          : <p>{`No chain is open. Total so far: ${total}.`}</p>}
      </div>

      <ol className="kf-chains" aria-label="Finished chains">
        {chains.length === 0 && <li className="kf-chain kf-chain--empty">No chain finished yet.</li>}
        {chains.map((c, i) => (
          <li key={i} className="kf-chain">
            <span className="kf-chain__values">{c.values.join(' - ')}</span>
            <span className="kf-chain__ways">{`${c.ways} choice${c.ways === 1 ? '' : 's'}`}</span>
          </li>
        ))}
      </ol>
      <p className="kf-total">{`Total product: ${total}`}</p>
    </section>
  )
}
