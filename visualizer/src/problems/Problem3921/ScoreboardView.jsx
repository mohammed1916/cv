import './ScoreboardView.css'

export default function ScoreboardView({ run, step }) {
  const events = run.input.events
  const stopAt = step.wickets === 10 ? step.index : -1
  return (
    <section className="scoreboard" aria-label="Innings scoreboard">
      <div className="scoreboard__totals">
        <p><span>Score</span><strong>{step.score}</strong></p>
        <p><span>Wickets</span><strong>{step.wickets} / 10</strong></p>
      </div>
      <ol className="scoreboard__pips" aria-label="Wicket counter">
        {Array.from({ length: 10 }, (_, i) => <li key={i} className={i < step.wickets ? 'is-out' : ''}>{i < step.wickets ? 'X' : ''}</li>)}
      </ol>
      <ol className="scoreboard__tokens" aria-label="Event tokens">
        {events.map((token, i) => {
          const cls = [i === step.index ? 'is-current' : '', i < step.index ? 'is-read' : '', stopAt >= 0 && i > stopAt ? 'is-ignored' : ''].join(' ')
          return <li key={i} className={cls}>{token}</li>
        })}
      </ol>
      <p role="status">{step.message}</p>
    </section>
  )
}
