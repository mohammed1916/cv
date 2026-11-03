import './BrightnessTimelineView.css'

// Draws the bulb row for one time unit: the greedy plan lights the leftmost unlit position with a bulb beside it.
function litPlan(bulbs, need) {
  const lit = new Set()
  const active = []
  for (let k = 0; k < need; k++) {
    let u = 1
    while (lit.has(u) && u <= bulbs) u++
    if (u > bulbs) break
    const bulb = Math.min(bulbs, u + 1)
    active.push(bulb)
    for (const p of [bulb - 1, bulb, bulb + 1]) if (p >= 1 && p <= bulbs) lit.add(p)
  }
  return { lit, active }
}

export default function BrightnessTimelineView({ run, step }) {
  const { bulbs, brightness, intervals } = run.input
  const maxTime = Math.max(...intervals.map(([, e]) => e))
  const minTime = Math.min(...intervals.map(([s]) => s))
  const plan = litPlan(bulbs, step.need)
  const times = Array.from({ length: maxTime - minTime + 1 }, (_, i) => minTime + i)
  const inBlock = t => (step.blocks || []).some(([s, e]) => t >= s && t <= e)
  const current = step.current >= 0 ? step.blocks[step.current] : null
  return (
    <section className="brightness" aria-label="Brightness timeline">
      <div className="brightness__timeline" role="list" aria-label="Times">
        {times.map(t => {
          const covered = inBlock(t)
          const hot = current && t >= current[0] && t <= current[1]
          return <div key={t} role="listitem" className={`brightness__time${covered ? ' brightness__time--on' : ''}${hot ? ' brightness__time--hot' : ''}`}>
            <span>{t}</span>
          </div>
        })}
      </div>
      <p className="brightness__caption">{`Each lit time unit needs ${step.need} active bulb${step.need === 1 ? '' : 's'} (brightness ${brightness}).`}</p>
      <div className="brightness__bulbs" role="list" aria-label="Bulb row for one time unit">
        {Array.from({ length: bulbs }, (_, i) => i + 1).map(p => {
          const active = plan.active.includes(p)
          return <div key={p} role="listitem" className={`brightness__bulb${active ? ' brightness__bulb--active' : ''}${plan.lit.has(p) ? ' brightness__bulb--lit' : ''}`}>
            <span>{active ? 'on' : plan.lit.has(p) ? 'lit' : 'dark'}</span>
            <small>{p}</small>
          </div>
        })}
      </div>
      <output aria-label="Energy so far">{`Energy so far: ${step.energy}`}</output>
    </section>
  )
}
