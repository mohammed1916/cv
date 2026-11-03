import './MoveWalkView.css'

export default function MoveWalkView({ run, step }) {
  const chars = run.input.split('')
  return (
    <section className="move-walk" aria-label="Move walk">
      <ol className="move-walk__chips" aria-label="Moves">
        {chars.map((ch, i) => {
          const shown = step.phase === 'walk' && step.index === i
          const past = step.phase === 'walk' && step.index > i
          return <li key={i} className={`move-walk__chip${ch === '_' ? ' move-walk__chip--blank' : ''}${shown ? ' move-walk__chip--active' : ''}${past ? ' move-walk__chip--past' : ''}`}>
            <span>{ch}</span>
            {shown && ch === '_' && <small>{`acts as ${step.used}`}</small>}
          </li>
        })}
      </ol>
      <dl className="move-walk__state">
        <dt>Position</dt><dd>{`(${step.x}, ${step.y})`}</dd>
        <dt>Underscores</dt><dd>{step.blanks}</dd>
        <dt>Direction for underscores</dt><dd>{step.sign === null ? 'not chosen' : step.sign > 0 ? 'right' : 'left'}</dd>
        <dt>Distance</dt><dd>{step.phase === 'done' ? `${step.result}` : `${Math.abs(step.x) + Math.abs(step.y)} so far`}</dd>
      </dl>
      <p className="move-walk__message">{step.message}</p>
    </section>
  )
}
