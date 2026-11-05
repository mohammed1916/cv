// The road is a row of cells. Leading L cars and trailing R cars are dimmed (they drive away); the middle is active.
export default function RoadView({ run, step }) {
  const { road } = run.input
  const left = step.left ?? 0
  const right = step.right ?? road.length - 1
  const arrow = { L: '←', R: '→', S: '■' }
  return (
    <div className="road-view">
      <div className="road-row" role="img" aria-label={`Road ${road}`}>
        {road.split('').map((d, i) => {
          const away = i < left || i > right
          return <div key={i} className={`road-cell${away ? ' is-away' : ''}${i === step.index ? ' is-current' : ''}`}>
            <small>{i}</small><strong>{arrow[d]}</strong><span>{d}</span>
          </div>
        })}
      </div>
      <p>Middle section: positions {left} to {right}. Cars drive away at the ends and never collide there.</p>
      <p>Collisions so far: <strong>{step.ans}</strong></p>
    </div>
  )
}
