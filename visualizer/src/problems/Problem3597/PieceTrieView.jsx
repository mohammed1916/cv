import TrieStateDiagram from '../../components/shared/TrieStateDiagram'

const mix = (pct, color = 'var(--primary)') => `color-mix(in srgb, ${color} ${pct}%, var(--surface2))`

// Cuts appear on the string while the same pieces grow the trie, so "seen before" is a walk along edges.
export default function PieceTrieView({ run, step }) {
  const { s } = run.input
  const pieceOf = index => step.pieces.findIndex(piece => piece.from <= index && index <= piece.to)
  const inWindow = index => step.at >= step.start && index >= step.start && index <= step.at
  const inTail = index => step.tail && index >= step.tail.from
  const trieNodes = step.nodes
  const walking = step.nodes[step.activeNode]?.prefix ?? ''
  return <section aria-label="String cuts and the trie of kept pieces" style={{ color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }} aria-label="String with cuts">
      {[...s].map((c, i) => {
        const owner = pieceOf(i)
        const isCut = owner >= 0 && step.pieces[owner].to === i
        const background = inTail(i) ? 'var(--surface3)' : inWindow(i) ? mix(36) : owner >= 0 ? mix(owner % 2 ? 22 : 10, owner % 2 ? 'var(--success)' : 'var(--primary)') : 'var(--surface)'
        return <div key={i} data-index={i} data-piece={owner} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 34, textAlign: 'center' }}>
            <small style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)' }}>{i}</small>
            <div style={{ height: 34, lineHeight: '30px', borderRadius: 4, background, fontWeight: i === step.at ? 700 : 400, border: `2px ${inTail(i) ? 'dashed' : 'solid'} ${i === step.at ? 'var(--primary)' : 'var(--border)'}` }}>{c}</div>
            <small style={{ display: 'block', fontSize: 10, height: 14 }}>{i === step.start && step.start < s.length ? 'start' : i === step.at && step.phase !== 'done' ? 'i' : ''}</small>
          </div>
          <div aria-hidden={!isCut} data-cut={isCut || undefined} style={{ width: 4, height: 40, margin: '0 1px', borderRadius: 2, background: isCut ? 'var(--text)' : 'transparent' }} />
        </div>
      })}
    </div>
    <div aria-label="Kept pieces" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 30 }}>
      <strong>kept</strong>
      {step.pieces.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>none yet</span>}
      {step.pieces.map((piece, index) => <span key={index} style={{ padding: '2px 9px', borderRadius: 12, background: mix(index % 2 ? 22 : 10, index % 2 ? 'var(--success)' : 'var(--primary)'), border: '1px solid var(--border)' }}>{piece.text}</span>)}
      {step.tail && <span style={{ padding: '2px 9px', borderRadius: 12, border: '1px dashed var(--border)', textDecoration: 'line-through' }}>{step.tail.text}</span>}
    </div>
    <p style={{ margin: 0 }}>Walking: <strong>{walking ? `"${walking}"` : 'at the root'}</strong></p>
    <TrieStateDiagram nodes={trieNodes} activeNode={step.activeNode} />
    <p style={{ margin: 0, fontSize: '0.85rem' }}>Every node below the root is one kept piece, spelled by the edges from the root. Green marks the node just added.</p>
  </section>
}
