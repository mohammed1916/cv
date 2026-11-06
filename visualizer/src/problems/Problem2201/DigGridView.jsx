import IndexedSequence from '../../components/shared/IndexedSequence'
// Grid of cells. Dug cells are filled. The artifact being checked is outlined; its cells show how many are dug.
export default function DigGridView({ run, step }) {
  const { n, artifacts } = run.input
  const dug = new Set(step.dug ?? [])
  const current = step.artifact ?? null
  const inCurrent = (r, c) => current && r >= current[0] && r <= current[2] && c >= current[1] && c <= current[3]
  return (
    <div className="dig-grid-view">
      <div className="dig-grid" style={{ gridTemplateColumns: `repeat(${n}, 2.2rem)` }} role="img" aria-label={`${n} by ${n} grid`}>
        {Array.from({ length: n * n }, (_, idx) => {
          const r = Math.floor(idx / n); const c = idx % n
          return <div key={idx} className={`dig-cell${dug.has(`${r},${c}`) ? ' is-dug' : ''}${inCurrent(r, c) ? ' in-check' : ''}`}>{r},{c}</div>
        })}
      </div>
      <IndexedSequence label="artifacts (input array): [r1, c1, r2, c2]" length={artifacts.length} valueAt={i => artifacts[i].join(', ')} active={step.index ?? -1} />
      <ul className="artifact-list">
        {artifacts.map((a, i) => <li key={i} className={current && a.join() === current.join() ? 'is-current' : ''}>Artifact {i}: rows {a[0]}-{a[2]}, columns {a[1]}-{a[3]}{step.index > i || step.phase === 'done' ? ' (checked)' : ''}</li>)}
      </ul>
      {current && <p>{step.count} of {step.area} cells dug in this artifact.</p>}
      <p>Extractable so far: <strong>{step.ans}</strong></p>
    </div>
  )
}
