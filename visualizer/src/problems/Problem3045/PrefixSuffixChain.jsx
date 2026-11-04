// The current word as outside-in letter pairs, and the earlier words that are both a prefix and a suffix of it.
export default function PrefixSuffixChain({ run, step }) {
  if (!step.word) return null
  const frames = run?.frames ?? []
  const upto = frames.indexOf(step)
  const earlierCount = frames.slice(0, upto).filter(f => f.phase === 'insert').length
  const earlier = run.input.words.slice(0, earlierCount)
  const w = step.word
  const pairs = []
  for (let k = 0; k < Math.ceil(w.length / 2); k++) pairs.push([w[k], w[w.length - 1 - k]])
  const matches = earlier.filter(u => u.length < w.length && w.startsWith(u) && w.endsWith(u))
  return <section aria-label="Outside-in letter pairs" style={{ color: 'var(--text)', margin: '8px 0' }}>
    <div style={{ fontSize: 13, marginBottom: 4 }}>Letter pairs of {w}, read from the outside in</div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {pairs.map(([a, b], k) => <span key={k} style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace' }}>{a}{b}</span>)}
    </div>
    <div style={{ fontSize: 13, marginTop: 8 }}>Earlier words that are both a prefix and a suffix: {matches.length ? matches.join(', ') : 'none'}</div>
  </section>
}
