import IndexedSequence from '../../components/shared/IndexedSequence'

function cellStyle(size, kind) {
  const base = { width: size, height: size, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontSize: size >= 34 ? 13 : 10, fontWeight: 600, borderRadius: 4, color: 'var(--text)' }
  if (kind === 'wall') return { ...base, background: 'var(--surface3)', border: '1px solid var(--border)', opacity: 0.55 }
  if (kind === 'current') return { ...base, background: 'color-mix(in srgb, var(--primary) 34%, var(--surface2))', border: '3px solid var(--primary)' }
  if (kind === 'fresh') return { ...base, background: 'color-mix(in srgb, var(--warning) 20%, var(--surface2))', border: '2px solid var(--warning)' }
  if (kind === 'edge') return { ...base, background: 'color-mix(in srgb, var(--info) 18%, var(--surface2))', border: '1px solid var(--info)' }
  return { ...base, background: 'var(--surface2)', border: '1px solid var(--text-muted)' }
}

const LEGEND = [['current', 'working cell'], ['fresh', 'just opened'], ['edge', 'corridor with 1 path'], ['open', 'block or link'], ['wall', 'blocked']]

// Every open cell prints how many paths reach it, so doubling and adding 1 can be read straight off the grid.
export default function GridBuildView({ run, step }) {
  const { rows, cols, counts, edge } = step
  const size = Math.max(rows, cols) > 13 ? 28 : 38
  const fresh = new Set(step.fresh.map(([r, c]) => `${r}:${c}`))
  const kindOf = (r, c) => {
    if (counts[r][c] === null) return 'wall'
    if (r === step.cell[0] && c === step.cell[1]) return 'current'
    if (fresh.has(`${r}:${c}`)) return 'fresh'
    return edge[r][c] ? 'edge' : 'open'
  }
  const bits = run.bits
  return <section aria-label="Grid under construction" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <IndexedSequence label={`Binary digits of k = ${run.input.k}`} length={bits.length} valueAt={i => bits[i]} active={step.bitIndex < bits.length ? step.bitIndex : -1} roleAt={i => (i < step.bitIndex ? 'written' : '')} />
    <div aria-label="Path count so far" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, fontSize: 14 }}>
      <span style={{ color: 'var(--text-muted)' }}>Working cell count:</span>
      {step.chain.map((value, i) => <span key={i}>{i > 0 && <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>→ </span>}<strong style={{ color: i === step.chain.length - 1 ? 'var(--primary)' : 'var(--text)' }}>{value}</strong></span>)}
      <span style={{ color: 'var(--text-muted)' }}>· target {run.input.k}</span>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <div role="grid" aria-label={`Grid of ${rows} rows and ${cols} columns`} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: 2, width: 'max-content' }}>
        {counts.flatMap((row, r) => row.map((value, c) => <div key={`${r}:${c}`} role="gridcell" data-row={r} data-column={c} data-chat-selectable data-chat-label={`Grid cell [${r}, ${c}]: ${value === null ? 'blocked' : `${value} paths`}`} style={cellStyle(size, kindOf(r, c))}>{value ?? ''}</div>))}
      </div>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
      {LEGEND.map(([kind, text]) => <span key={kind} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={cellStyle(14, kind)} />{text}</span>)}
    </div>
    {step.phase === 'done' && <output aria-label="Constructed grid" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, whiteSpace: 'pre', overflowX: 'auto', padding: 8, border: '2px solid var(--primary)', borderRadius: 8 }}>{run.result.join('\n')}</output>}
  </section>
}
