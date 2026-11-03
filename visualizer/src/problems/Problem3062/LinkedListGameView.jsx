import './LinkedListGameView.css'

export default function LinkedListGameView({ run, step }) {
  const values = run.input
  return (
    <div className="llg">
      <p className="llg__caption">Nodes are paired from the head: pair 0 is nodes 0 and 1, pair 1 is nodes 2 and 3, and so on.</p>
      <ol className="llg__list" aria-label="Linked list nodes">
        {values.map((value, i) => {
          const pair = Math.floor(i / 2)
          const team = i % 2 === 0 ? 'even' : 'odd'
          const active = step.pair === pair
          const wins = active && step.outcome === team
          return (
            <li key={i} className={`llg__node llg__node--${team}${active ? ' is-active' : ''}${wins ? ' is-win' : ''}`}>
              <span className="llg__index">node {i}</span>
              <span className="llg__value">{value}</span>
              <span className="llg__team">{team === 'even' ? 'Even index' : 'Odd index'}</span>
            </li>
          )
        })}
      </ol>
      <div className="llg__score" aria-label="Scores">
        <div className="llg__tally llg__tally--even"><strong>Even team</strong><span>{step.even} point{step.even === 1 ? '' : 's'}</span></div>
        <div className="llg__tally llg__tally--odd"><strong>Odd team</strong><span>{step.odd} point{step.odd === 1 ? '' : 's'}</span></div>
      </div>
      <p className="llg__outcome" role="status">{step.phase === 'done' ? `Result: ${run.result}` : step.outcome === 'tie' ? 'This pair is a tie.' : step.outcome ? `Point to the ${step.outcome} team.` : 'Scores start at zero.'}</p>
    </div>
  )
}
