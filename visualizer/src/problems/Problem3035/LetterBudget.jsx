// Letters grouped into pairs and singles, and the words in ascending length with the one that stops the greedy count.
export default function LetterBudget({ words, step }) {
  const counts = {}
  for (const w of words) for (const ch of w) counts[ch] = (counts[ch] ?? 0) + 1
  const letters = Object.keys(counts).sort()
  const sorted = [...words].map(w => w.length).sort((a, b) => a - b)
  return <section aria-label="Letter budget" style={{ color: 'var(--text)', margin: '8px 0' }}>
    <div style={{ fontSize: 13, marginBottom: 4 }}>Each letter contributes count divided by two pairs, and a single if the count is odd.</div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {letters.map(ch => <div key={ch} style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 8px', minWidth: 48, textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{ch}</div>
        <div style={{ fontSize: 12 }}>{Math.floor(counts[ch] / 2)} pair{Math.floor(counts[ch] / 2) === 1 ? '' : 's'}{counts[ch] % 2 ? ' + 1 single' : ''}</div>
      </div>)}
    </div>
    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {sorted.map((len, i) => <span key={i} style={{
        padding: '3px 8px', borderRadius: 6, fontSize: 12,
        border: `2px solid ${i === step.best && step.phase === 'stop' ? 'var(--primary)' : 'var(--surface2)'}`,
        background: i < step.best ? 'var(--surface2)' : 'transparent', opacity: i < step.best || step.phase === 'done' || step.phase === 'stop' || step.phase === 'take' ? 1 : 0.6,
      }}>length {len} needs {Math.floor(len / 2)} pair{Math.floor(len / 2) === 1 ? '' : 's'}{len % 2 ? ' and 1 centre letter' : ''}{i < step.best ? ' (kept)' : ''}</span>)}
    </div>
  </section>
}
