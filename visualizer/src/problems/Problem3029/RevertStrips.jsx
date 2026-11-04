// The word, with the first t*k letters removed each round, and the remainder compared with the start of the word.
export default function RevertStrips({ word, t, k, rest, prefix }) {
  const cut = t * k
  const letter = (ch, state, i) => <span key={`${state}-${i}`} style={{
    display: 'inline-block', minWidth: 22, textAlign: 'center', padding: '3px 2px', margin: 1, fontFamily: 'monospace',
    color: 'var(--text)', borderRadius: 4,
    border: `1px solid ${state === 'removed' ? 'var(--surface2)' : 'var(--primary)'}`,
    opacity: state === 'removed' ? 0.4 : 1, textDecoration: state === 'removed' ? 'line-through' : 'none',
    background: state === 'match' ? 'var(--surface2)' : 'transparent',
  }}>{ch}</span>
  const restCells = rest === undefined ? null : [...rest].map((ch, i) => letter(ch, prefix && prefix[i] === ch ? 'match' : 'mismatch', i))
  return <section aria-label="Remove and compare" style={{ margin: '8px 0', color: 'var(--text)' }}>
    <div style={{ fontSize: 13, marginBottom: 2 }}>Word with the first {cut} letters removed</div>
    <div>{[...word].map((ch, i) => letter(ch, i < cut ? 'removed' : 'kept', i))}</div>
    {rest !== undefined && <>
      <div style={{ fontSize: 13, margin: '8px 0 2px' }}>Remaining letters, lined up against the start of the word</div>
      <div>{restCells}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>Start of the word: <span style={{ fontFamily: 'monospace' }}>{prefix}</span></div>
    </>}
  </section>
}
