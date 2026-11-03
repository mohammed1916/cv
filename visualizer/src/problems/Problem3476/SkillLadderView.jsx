import './SkillLadderView.css'

// One column per skill: worker tokens on top, the task ladder below. Taken tasks are filled, the extra worker's task is outlined.
export default function SkillLadderView({ run, step }) {
  if (!run || !step) return <section className="skill-view"><p className="skill-empty">Press Play to match workers to tasks by skill.</p></section>
  const { workers, tasks } = run.input
  const { groups, extraTask, best, candidate } = step
  const skills = [...new Set(tasks.map(([s]) => s))].sort((a, b) => a - b)
  const byIndex = new Map(groups.map(g => [g.skill, g]))
  return (
    <section className="skill-view" aria-label="Skill matching columns">
      <div className="skill-columns" style={{ gridTemplateColumns: `repeat(${skills.length}, minmax(120px, 1fr))` }}>
        {skills.map(skill => {
          const g = byIndex.get(skill)
          const workerCount = workers.filter(w => w === skill).length
          return (
            <div key={skill} className="skill-column">
              <h3>Skill {skill}</h3>
              <div className="skill-workers" aria-label={`${workerCount} workers with skill ${skill}`}>
                {Array.from({ length: workerCount }, (_, i) => <span key={i} className="skill-worker">W</span>)}
                {workerCount === 0 && <span className="skill-none">no workers</span>}
              </div>
              <ol className="skill-ladder">
                {(g ? g.ranked : tasks.map((t, i) => i).filter(i => tasks[i][0] === skill)).map(index => {
                  const taken = g && g.taken.includes(index)
                  const extra = index === extraTask
                  const cls = ['skill-task', taken ? 'skill-task--taken' : '', extra ? 'skill-task--extra' : ''].join(' ')
                  return <li key={index} className={cls}>task {index}: profit {tasks[index][1]}{taken ? ' · matched' : ''}{extra ? ' · extra' : ''}</li>
                })}
              </ol>
              {g && <p className="skill-sub">Matched total {g.subtotal}</p>}
            </div>
          )
        })}
      </div>
      <p className="skill-summary">
        {extraTask >= 0 ? `Extra worker takes task ${extraTask}: candidate ${candidate}. ` : ''}
        Best so far {best === null || best === undefined ? '-' : best}.
      </p>
    </section>
  )
}
