import './RatioGroupsView.css'

// Each group shows its root and every variable's ratio to that root. The equation being applied is in the caption.
export default function RatioGroupsView({ step }) {
  const roots = [...new Set(step.groups.map(g => g.root))]
  const touched = new Set(step.eq ? [step.eq[0], step.eq[1]] : [])
  const bad = step.phase === 'check' && step.contradiction
  return (
    <div className="ratio-view">
      <div className="ratio-groups" role="list" aria-label="Ratio groups">
        {roots.map(root => {
          const members = step.groups.filter(g => g.root === root)
          const isTouched = members.some(m => touched.has(m.name))
          const cls = bad && isTouched ? 'ratio-group ratio-group--bad' : isTouched ? 'ratio-group ratio-group--touched' : 'ratio-group'
          return <div key={root} className={cls} role="listitem">
            <span className="ratio-group__root">root {root}</span>
            {members.map(m => <span key={m.name} className="ratio-group__member">{m.name} = {m.ratio} · {root}</span>)}
          </div>
        })}
      </div>
      <p className="ratio-caption">{step.eq ? `Equation: ${step.eq[0]} / ${step.eq[1]} = ${step.eq[2]}.` : 'Reading the equations in order.'}</p>
      {step.phase === 'done' && <p className={`ratio-verdict${step.contradiction ? ' ratio-verdict--bad' : ''}`}>{step.contradiction ? 'Contradiction found.' : 'No contradiction.'}</p>}
    </div>
  )
}
