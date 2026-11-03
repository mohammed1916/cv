import './CategoryGroupsView.css'

const GROUP_TONES = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8']

export default function CategoryGroupsView({ run, step }) {
  const n = run.input.length
  const groups = step.reps.map((rep, g) => ({
    rep,
    tone: GROUP_TONES[g % GROUP_TONES.length],
    members: step.assigned.map((owner, i) => (owner === g ? i : -1)).filter(i => i >= 0),
  }))
  const verdict = step.same === null ? 'No query yet' : step.same ? 'Answer: same category' : 'Answer: different category'

  return (
    <div className="category-view">
      <div className="category-strip" role="list" aria-label="Elements">
        {Array.from({ length: n }, (_, i) => {
          const owner = step.assigned[i]
          const classes = ['category-tile']
          if (owner >= 0) classes.push(GROUP_TONES[owner % GROUP_TONES.length])
          if (i === step.element) classes.push('current')
          if (i === step.rep) classes.push('compared')
          return (
            <div key={i} role="listitem" className={classes.join(' ')}>
              <span className="tile-index">{i}</span>
              <span className="tile-mark">{owner >= 0 ? `G${owner + 1}` : step.element === i ? 'now' : '?'}</span>
            </div>
          )
        })}
      </div>

      <div className="category-query" aria-live="polite">
        <span className="query-pair">
          {step.element >= 0 ? `element ${step.element}` : 'no element'}
          {step.rep >= 0 ? ` vs representative ${step.rep}` : ''}
        </span>
        <span className={`query-answer ${step.same === null ? '' : step.same ? 'yes' : 'no'}`}>{verdict}</span>
        <span className="query-count">{`${step.queries} quer${step.queries === 1 ? 'y' : 'ies'} so far`}</span>
      </div>

      <div className="category-groups" aria-label="Categories found so far">
        {groups.length === 0 && <p className="empty-note">No categories yet.</p>}
        {groups.map((group, g) => (
          <div key={g} className={`category-group ${group.tone}`}>
            <strong>{`G${g + 1}`}</strong>
            <span className="group-rep">{`rep ${group.rep}`}</span>
            <span className="group-members">{group.members.join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
