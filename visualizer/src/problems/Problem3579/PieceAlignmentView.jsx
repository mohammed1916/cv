const W = 34
const GAP = 4
const tone = { match: 'var(--success-glow)', swap: 'var(--warning-glow)', replace: 'var(--error-glow)' }
const mark = { match: '=', swap: '⇄', replace: '✎' }

const box = { width: W, height: 34, display: 'grid', placeItems: 'center', borderRadius: 5, fontFamily: 'monospace', fontSize: 16, color: 'var(--text)', border: '1px solid var(--border)' }

function Letters({ label, word, start, end, plan }) {
  const pieceOf = i => plan?.findIndex(p => i >= p.start && i < p.end) ?? -1
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 52, color: 'var(--text-muted)', flex: 'none' }}>{label}</span>
    <div style={{ display: 'flex', gap: GAP }}>
      {[...word].map((letter, i) => {
        const inside = start !== null && end !== null && i >= start && i < end
        const piece = pieceOf(i)
        const firstOfPiece = piece >= 0 && plan[piece].start === i && i > 0
        return <div key={i} data-index={i} data-in-piece={inside || undefined} style={{ ...box, background: inside ? 'var(--primary-glow)' : 'var(--surface2)', borderLeft: firstOfPiece ? '3px solid var(--primary)' : box.border }}>{letter}</div>
      })}
    </div>
  </div>
}

// The piece under test, letter over letter, with an arc joining the two ends of each swap.
function Alignment({ align, reversedPiece, title }) {
  const count = align.cells.length
  const width = count * (W + GAP)
  const center = p => p * (W + GAP) + W / 2
  return <div>
    <strong style={{ color: 'var(--text)' }}>{title}{reversedPiece ? ' (reversed first, +1)' : ''}</strong>
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <svg width={width} height={align.swaps.length ? 34 : 4} style={{ display: 'block' }} aria-hidden="true">
        {align.swaps.map(([p, q]) => <path key={p} d={`M ${center(p)} 32 C ${center(p)} 2 ${center(q)} 2 ${center(q)} 32`} fill="none" stroke="var(--warning)" strokeWidth="2" />)}
      </svg>
      {['have', 'kind', 'want'].map(field => <div key={field} style={{ display: 'flex', gap: GAP, marginBottom: GAP }}>
        {align.cells.map((c, p) => <div key={p} data-kind={c.kind} style={{ ...box, background: tone[c.kind], ...(field === 'kind' ? { border: 'none', height: 22, fontSize: 14, background: 'transparent' } : {}) }}>
          {field === 'kind' ? mark[c.kind] : c[field]}
        </div>)}
      </div>)}
    </div>
    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>= already right · ⇄ one swap fixes both · ✎ one replace</p>
    <p style={{ margin: '2px 0 0', color: 'var(--text)' }}>{align.swaps.length} swap, {align.replaces.length} replace{reversedPiece ? ', 1 reverse' : ''}: cost <strong>{align.cost + (reversedPiece ? 1 : 0)}</strong></p>
  </div>
}

export function PlanList({ plan }) {
  return <ol aria-label="Chosen pieces" style={{ margin: 0, paddingLeft: 20, color: 'var(--text)' }}>
    {plan.map(p => <li key={p.start}>
      <code>{p.have}</code> to <code>{p.want}</code>: {[p.reversed && 'reverse', p.swaps.length && `${p.swaps.length} swap`, p.replaces.length && `${p.replaces.length} replace`].filter(Boolean).join(', ') || 'nothing to do'} (cost {p.cost})
    </li>)}
  </ol>
}

export default function PieceAlignmentView({ run, step }) {
  const { word1, word2 } = run.input
  const hasPiece = step.start !== null
  const end = hasPiece ? step.end : null
  return <section aria-label="Words and current piece" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <div style={{ display: 'grid', gap: GAP, overflowX: 'auto' }}>
      <Letters label="word1" word={word1} start={step.start} end={end} plan={step.plan} />
      <Letters label="word2" word={word2} start={step.start} end={end} plan={step.plan} />
    </div>
    {step.align && <Alignment align={step.align} reversedPiece={step.reversedPiece} title={step.phase === 'relax' ? 'Cheaper way for this piece' : step.phase === 'trace' ? 'Winning piece' : 'Current piece'} />}
    {step.plan && <PlanList plan={step.plan} />}
  </section>
}
