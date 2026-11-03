import './ShiftQueueView.css'

export default function ShiftQueueView({ run, step }) {
  const tasks = run.input.tasks
  const budget = step.budget
  const left = step.left ?? 0
  const spent = budget ? budget - left : 0
  return (
    <figure className="shift-queue" aria-label="Task queue for the current shift">
      <ol className="shift-queue__tasks">
        {tasks.map((duration, i) => {
          const done = i < step.idx
          const current = i === step.idx && step.idx < tasks.length
          return (
            <li key={i} className={['shift-queue__task', done ? 'is-done' : '', current ? 'is-current' : ''].filter(Boolean).join(' ')}>
              <span className="shift-queue__name">{`Task ${i}`}</span>
              <span className="shift-queue__bar" style={{ width: `${duration * 1.6}rem` }}>
                {current && step.rem !== null ? <i style={{ width: `${(100 * (duration - step.rem)) / duration}%` }} /> : null}
              </span>
              <span className="shift-queue__need">{done ? 'done' : current ? `${step.rem} left` : `${duration}`}</span>
            </li>
          )
        })}
      </ol>
      {budget ? (
        <div className="shift-queue__budget" aria-label="Shift budget">
          <span>{`Shift ${step.shift + 1}: ${spent} of ${budget} used`}</span>
          <span className="shift-queue__gauge"><i style={{ width: `${(100 * spent) / budget}%` }} /></span>
        </div>
      ) : null}
      <p className="shift-queue__counts">{`Unfinished after each shift: ${step.answer.length ? step.answer.join(', ') : 'none yet'}`}</p>
    </figure>
  )
}
