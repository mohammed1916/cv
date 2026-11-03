import './GapGraphView.css'

const fmt = v => (Number.isFinite(v) ? String(v) : '∞')

export default function GapGraphView({ run, step }) {
  const nums = run.input.nums
  const lo = nums[0]
  const hi = nums[nums.length - 1]
  const x = v => 50 + (hi === lo ? 0 : ((v - lo) / (hi - lo)) * 540)
  const y = 130
  return (
    <section className="gap-graph" aria-label="Indices placed by value">
      <svg viewBox="0 0 640 240" role="img" aria-label="Index positions on the value line with closest-neighbour arcs">
        <line x1="50" y1={y} x2="590" y2={y} className="gap-graph__axis" />
        {nums.map((_, i) => {
          const c = step.closest[i]
          const a = x(nums[i])
          const b = x(nums[c])
          const cls = i === step.current && step.relaxTo === c ? 'is-relax' : i === step.current ? 'is-current-link' : 'is-link'
          return <path key={`arc${i}`} d={`M ${a} ${y} Q ${(a + b) / 2} ${y - 80} ${b} ${y}`} className={`gap-graph__arc ${cls}`} />
        })}
        {nums.map((v, i) => {
          const cls = i === step.current ? 'is-current' : i === step.start || i === step.end ? 'is-query' : ''
          return (
            <g key={`node${i}`} className={cls}>
              <circle cx={x(v)} cy={y} r="14" className="gap-graph__node" />
              <text x={x(v)} y={y + 4} textAnchor="middle" className="gap-graph__label">{i}</text>
              <text x={x(v)} y={y + 34} textAnchor="middle" className="gap-graph__value">value {v}</text>
              {step.dist && <text x={x(v)} y={y + 52} textAnchor="middle" className="gap-graph__dist">cost {fmt(step.dist[i])}</text>}
            </g>
          )
        })}
      </svg>
      <p role="status">{step.start >= 0 ? `Query from ${step.start} to ${step.end}.` : 'Each index links to its closest neighbour (solid arc).'}</p>
      <output aria-label="Answers so far">{step.answers.length ? `Answers: ${step.answers.join(', ')}` : 'No answers yet'}</output>
    </section>
  )
}
