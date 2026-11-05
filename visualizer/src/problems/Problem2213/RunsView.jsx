import IndexedSequence from '../../components/shared/IndexedSequence'

// The updated string with the changed position marked. Runs are listed so the longest one is easy to see.
export default function RunsView({ run, step }) {
  const { s } = run.input
  const chars = step.chars ?? s.split('')
  const runs = []
  let start = 0
  for (let i = 1; i <= chars.length; i++) {
    if (i === chars.length || chars[i] !== chars[i - 1]) { runs.push({ from: start, to: i - 1, ch: chars[start] }); start = i }
  }
  const longest = runs.reduce((a, b) => (b.to - b.from > a.to - a.from ? b : a), runs[0] ?? { from: 0, to: -1, ch: '' })
  return (
    <div className="runs-view">
      <IndexedSequence label="characters" length={chars.length} valueAt={i => chars[i]} active={step.changed ?? -1}
        roleAt={i => (i >= longest.from && i <= longest.to ? 'longest run' : '')} />
      <p>Query {step.q !== undefined && step.q >= 0 ? step.q : '-'}: changed index {step.changed ?? '-'}. Answers so far: {(step.answers ?? []).join(', ') || 'none'}.</p>
      {step.best !== undefined && <p>Longest run now: <strong>{step.best}</strong></p>}
    </div>
  )
}
