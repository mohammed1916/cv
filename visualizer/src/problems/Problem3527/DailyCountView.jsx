const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, var(--surface2))`

const chipStyle = (mark, isCurrent) => ({
  padding: '3px 8px', borderRadius: 6, fontSize: 13, color: 'var(--text)',
  border: `2px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
  background: mark === 'counted' ? tint('var(--success)', 35) : mark === 'repeat' ? 'transparent' : 'var(--surface2)',
  textDecoration: mark === 'repeat' ? 'line-through' : 'none',
  opacity: mark === 'repeat' ? 0.6 : mark === 'pending' ? 0.75 : 1,
  fontWeight: isCurrent ? 700 : 400,
})

// Days as rows of answers (repeats struck out), today's seen set, and a bar per answer in the count table.
export default function DailyCountView({ run, step }) {
  const { responses } = run.input
  const max = Math.max(1, ...step.counts.map(([, count]) => count), responses.length)
  return <section aria-label="Survey days and answer counts" style={{ color: 'var(--text)' }}>
    <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Answers by day</h3>
    <div style={{ display: 'grid', gap: 6 }}>
      {responses.map((words, d) => <div key={d} data-day={d} style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, padding: 5, borderRadius: 8,
        border: `2px solid ${d === step.day ? 'var(--primary)' : 'transparent'}`,
      }}>
        <strong style={{ minWidth: 48, fontSize: 13 }}>Day {d + 1}</strong>
        {words.map((word, w) => <span key={w} data-mark={step.marks[d][w]} style={chipStyle(step.marks[d][w], d === step.day && w === step.at)}>{word}</span>)}
      </div>)}
    </div>
    <p style={{ margin: '8px 0', fontSize: 13 }} aria-label="Seen today">
      <strong>Seen today: </strong>{step.day >= 0 ? (step.seen.length ? step.seen.join(', ') : 'nothing yet') : 'not in use'}
    </p>
    <h3 style={{ margin: '10px 0 6px', fontSize: '0.95rem' }}>Days each answer appeared on</h3>
    <div style={{ display: 'grid', gap: 5 }}>
      {step.counts.length === 0 && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>The table is empty.</p>}
      {step.counts.map(([word, count]) => {
        const isBest = word === step.best
        const isCandidate = word === step.candidate
        return <div key={word} data-word={word} data-best={isBest} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 66px', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ fontWeight: isBest || isCandidate ? 700 : 400 }}>{word}</span>
          <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 18, border: `2px solid ${isCandidate ? 'var(--primary)' : 'var(--border)'}` }}>
            <div style={{ width: `${(count / max) * 100}%`, height: '100%', borderRadius: 2, background: isBest ? 'var(--success)' : tint('var(--primary)', 55), transition: 'width .25s' }} />
          </div>
          <span>{count}{isBest ? ' best' : ''}</span>
        </div>
      })}
    </div>
    <output aria-label="Best answer" style={{ display: 'block', marginTop: 10, fontWeight: 700 }}>{step.best === null ? 'best = none yet' : `best = "${step.best}" with ${step.bestCount}`}</output>
  </section>
}
