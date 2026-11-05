// Health bar: starting health minus the running damage at each level. The armor-protected hit is shaded.
export default function HealthView({ run, step }) {
  const { damage, armor } = run.input
  const start = step.total + 1
  let running = 0
  const rows = damage.map((d, i) => {
    const hit = i === damage.indexOf(step.biggest) ? Math.min(d, armor) : 0
    running += d - hit
    return { level: i, damage: d, armor: hit, 'health after': start - running }
  })
  return (
    <div className="health-view">
      <p>Armor {armor} blocks up to {armor} damage once. Largest hit {step.biggest}; armor absorbs {step.absorbed}.</p>
      <div className="health-levels" role="img" aria-label="Health after each level">
        {rows.map(r => <div key={r.level} className="health-level">
          <small>level {r.level}</small>
          <div className="health-bar" style={{ height: `${Math.max(6, (r['health after'] / start) * 110)}px` }}><span>{r['health after']}</span></div>
          <small>-{r.damage}{r.armor ? ` (+${r.armor} armor)` : ''}</small>
        </div>)}
      </div>
      <p>Start with {start}. The health must stay above 0 at every level.</p>
    </div>
  )
}
