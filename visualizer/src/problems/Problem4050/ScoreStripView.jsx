import './ScoreStripView.css'

// A row of totals 0..n with the fewest days found so far, plus the day strip once the answer is known.
export default function ScoreStripView({ run, step }) {
  const n = run.input
  const totals = Array.from({ length: n + 1 }, (_, p) => p)
  const runsDone = step.phase === 'done'

  return (
    <section className="ssv" aria-label="Minimum days to score exactly n points">
      <div className="ssv-row" role="list" aria-label="Fewest days for each total">
        {totals.map(p => {
          const value = step.days[p]
          const cls = [
            'ssv-cell',
            p === step.p ? 'ssv-cell--now' : '',
            step.phase === 'improve' && p === step.p ? 'ssv-cell--new' : '',
            value === null ? 'ssv-cell--unknown' : '',
          ].join(' ')
          return (
            <div key={p} role="listitem" className={cls}>
              <span className="ssv-total">{p}</span>
              <span className="ssv-days">{value === null ? '?' : value === -1 ? '-1' : value}</span>
            </div>
          )
        })}
      </div>

      {step.phase === 'consider' || step.phase === 'improve' ? (
        <p className="ssv-line">
          Total {step.p}: run of {step.runLength} worth {(step.runLength * (step.runLength + 1)) / 2} points; candidate {step.candidate}{step.improved ? ' (kept)' : ' (not better)'}.
        </p>
      ) : null}

      {runsDone ? (
        <div className="ssv-strip" aria-label="One optimal day sequence">
          {run.strip.split('').map((ch, i) => (
            <span key={i} className={`ssv-day${ch === 'S' ? ' ssv-day--score' : ' ssv-day--skip'}`}>{ch === 'S' ? 'S' : 'skip'}</span>
          ))}
          <p className="ssv-line">Points per run: {run.runs.map(len => `${len}+...+1 = ${(len * (len + 1)) / 2}`).join(', ')}</p>
        </div>
      ) : null}

      <p className="ssv-key">Cells show the fewest days for each total. -1 is the starting offset that cancels the first run's extra skip.</p>
    </section>
  )
}
