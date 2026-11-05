// For every letter that appears, a pair of bars shows its count in s and in t. The gap is what must be added.
export default function LetterBarsView({ run, step }) {
  const letters = Array.from({ length: 26 }, (_, i) => i).filter(i => step.cs[i] > 0 || step.ct[i] > 0)
  const max = Math.max(1, ...step.cs, ...step.ct)
  const current = step.letter ?? -1
  return (
    <div className="letter-bars-view">
      <div className="letter-bars" role="img" aria-label={`Letter counts for ${run.input.s} and ${run.input.t}`}>
        {letters.map(i => <div key={i} className={`letter-pair${i === current ? ' is-current' : ''}`}>
          <div className="bar-pair">
            <div className="bar bar-s" style={{ height: `${(step.cs[i] / max) * 120}px` }} title={`s: ${step.cs[i]}`} />
            <div className="bar bar-t" style={{ height: `${(step.ct[i] / max) * 120}px` }} title={`t: ${step.ct[i]}`} />
          </div>
          <strong>{String.fromCharCode(97 + i)}</strong>
          <small>gap {Math.abs(step.cs[i] - step.ct[i])}</small>
        </div>)}
      </div>
      <p>Left bar: s. Right bar: t. The steps are the sum of all gaps.</p>
      <p>Steps so far: <strong>{step.steps}</strong></p>
    </div>
  )
}
