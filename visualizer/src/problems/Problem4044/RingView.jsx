import './RingView.css'

// Draws the values on a ring. The highlighted arc is the first half of the current rotation.
export default function RingView({ run, step }) {
  const nums = run.input
  const n = nums.length
  const size = 280
  const radius = 100
  const centre = size / 2
  const point = i => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / n
    return { x: centre + radius * Math.cos(angle), y: centre + radius * Math.sin(angle) }
  }
  const inFirst = i => step.window.includes(i)
  const second = step.second ?? null

  return (
    <section className="ring" aria-label="Cyclic rotations">
      <svg className="ring-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Ring of ${n} values, shift ${step.shift >= 0 ? step.shift : 'none'}`}>
        <circle cx={centre} cy={centre} r={radius} className="ring-track" />
        {nums.map((value, i) => {
          const p = point(i)
          const cls = `ring-node${inFirst(i) ? ' ring-node--first' : ' ring-node--second'}${i === step.leftIdx ? ' ring-node--leave' : ''}${i === step.enterIdx ? ' ring-node--enter' : ''}`
          return (
            <g key={i} className={cls}>
              <circle cx={p.x} cy={p.y} r={18} />
              <text x={p.x} y={p.y + 5} textAnchor="middle">{value}</text>
              <text x={p.x} y={p.y - 24} textAnchor="middle" className="ring-pos">{i}</text>
              {i === step.leftIdx && <text x={p.x} y={p.y + 34} textAnchor="middle" className="ring-pointer">out</text>}
              {i === step.enterIdx && <text x={p.x} y={p.y + 34} textAnchor="middle" className="ring-pointer">in</text>}
            </g>
          )
        })}
        <text x={centre} y={centre - 4} textAnchor="middle" className="ring-shift">shift {step.shift >= 0 ? step.shift : '-'}</text>
        <text x={centre} y={centre + 16} textAnchor="middle" className="ring-sums">{step.shift >= 0 ? `first ${step.first} / second ${second}` : ''}</text>
      </svg>

      <ul className="ring-legend" aria-label="Legend">
        <li><span className="ring-key ring-key--first" /> first half of this rotation (positions s to s+h-1)</li>
        <li><span className="ring-key ring-key--leave" /> value leaving the window</li>
        <li><span className="ring-key ring-key--enter" /> value entering the window</li>
      </ul>
      <output className="ring-count" aria-label="Good rotations so far">Good rotations: {step.count}{step.verdict === true ? ' (this shift is good)' : step.verdict === false ? ' (this shift is not good)' : ''}</output>
    </section>
  )
}
