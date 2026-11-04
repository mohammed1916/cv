const CELL = 42
const GAP = 4
const CHAR = 26

// Tints are translucent so var(--text) stays readable on them in both themes.
const ACROSS = 'rgba(37, 99, 235, 0.3)'
const DOWN = 'rgba(234, 88, 12, 0.32)'
const BOTH = 'rgba(147, 51, 234, 0.5)'

const center = i => i * (CELL + GAP) + CELL / 2

function strip(extra = {}) {
  return { width: CHAR, height: CHAR, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, boxSizing: 'border-box', border: '1px solid var(--border)', color: 'var(--text)', ...extra }
}

// The grid, the reading path that makes wrapping visible, and the KMP alignment of the pattern against the flat text.
export default function PatternCoverageView({ run, step }) {
  const { grid, pattern } = run.input
  const m = grid.length, n = grid[0].length, k = pattern.length
  const { pass, text } = step
  const toCell = pos => pass === 'across' ? { r: Math.floor(pos / n), c: pos % n } : { r: pos % m, c: Math.floor(pos / m) }
  const posOf = (r, c) => pass === 'across' ? r * n + c : c * m + r
  const alignStart = step.i >= 0 ? step.i - step.j + 1 : -1
  const pathCells = text ? Array.from({ length: text.length }, (_, pos) => toCell(pos)) : []
  const matchedSpan = pass && step.i >= 0 && step.j > 0 && step.compare !== 'mismatch' ? pathCells.slice(alignStart, step.i + 1) : []
  const points = cells => cells.map(({ r, c }) => `${center(c)},${center(r)}`).join(' ')
  const focus = step.cell ?? (pass && step.i >= 0 ? toCell(step.i) : pass && step.sweepAt >= 0 ? toCell(step.sweepAt) : null)
  const gridW = n * (CELL + GAP) - GAP, gridH = m * (CELL + GAP) - GAP
  const running = pass && step.sweepAt >= 0 ? step.active : null
  return <section aria-label="Pattern coverage" style={{ color: 'var(--text)', display: 'grid', gap: 12, justifyItems: 'start' }}>
    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
      {pass === 'across' ? 'Reading across: left to right, each row wrapping into the next.' : pass === 'down' ? 'Reading down: top to bottom, each column wrapping into the next.' : 'Cells tint as each reading covers them.'}
    </p>
    <div style={{ position: 'relative', width: gridW, height: gridH }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${CELL}px)`, gap: GAP }}>
        {grid.flatMap((row, r) => row.map((ch, c) => {
          const a = step.coveredAcross[r * n + c], d = step.coveredDown[c * m + r]
          const isFocus = focus && focus.r === r && focus.c === c
          return <div key={`${r}:${c}`} data-cell={`${r}:${c}`} data-covered={a && d ? 'both' : a ? 'across' : d ? 'down' : 'none'}
            style={{ position: 'relative', width: CELL, height: CELL, display: 'grid', placeItems: 'center', boxSizing: 'border-box', borderRadius: 5, fontWeight: 700,
              background: a && d ? BOTH : a ? ACROSS : d ? DOWN : 'var(--surface2)',
              border: a && d ? '2px solid var(--text)' : '1px solid var(--border)',
              outline: isFocus ? '3px solid var(--primary)' : 'none', outlineOffset: 1 }}>
            {ch}
            {pass && <small style={{ position: 'absolute', top: 1, left: 3, fontSize: 9, fontWeight: 400, color: 'var(--text-muted)' }}>{posOf(r, c)}</small>}
          </div>
        }))}
      </div>
      <svg width={gridW} height={gridH} viewBox={`0 0 ${gridW} ${gridH}`} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {pass && <polyline points={points(pathCells)} fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 4" opacity="0.7" />}
        {matchedSpan.length > 0 && <polyline points={points(matchedSpan)} fill="none" stroke={step.compare === 'hit' ? 'var(--success)' : 'var(--primary)'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />}
      </svg>
    </div>
    <p style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: 0, fontSize: 12 }}>
      <span style={{ background: ACROSS, padding: '1px 6px', borderRadius: 3 }}>across</span>
      <span style={{ background: DOWN, padding: '1px 6px', borderRadius: 3 }}>down</span>
      <span style={{ background: BOTH, padding: '1px 6px', borderRadius: 3 }}>both: counted</span>
    </p>

    {text && <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `72px repeat(${text.length}, ${CHAR}px)`, rowGap: 2, alignItems: 'center', fontSize: 12 }}>
        <span>{pass}</span>
        {[...text].map((ch, pos) => {
          const isCovered = pass === 'across' ? step.coveredAcross[pos] : step.coveredDown[pos]
          const shownCovered = step.sweepAt >= pos && isCovered
          const isNow = pos === step.i || pos === step.sweepAt
          return <span key={pos} data-text-pos={pos} style={strip({ background: shownCovered ? (pass === 'across' ? ACROSS : DOWN) : 'var(--surface2)', outline: isNow ? '2px solid var(--primary)' : 'none', outlineOffset: -2 })}>{ch}</span>
        })}
        {step.i >= 0 && <>
          <span style={{ gridColumnStart: 1 }}>pattern</span>
          {[...text].map((_, pos) => {
            const offset = pos - alignStart
            const inside = offset >= 0 && offset < k
            if (!inside) return <span key={pos} />
            const done = offset < step.j
            return <span key={pos} data-align={offset} style={strip({ background: done ? (step.compare === 'hit' ? 'rgba(22, 163, 74, 0.35)' : 'rgba(22, 163, 74, 0.2)') : 'transparent', borderStyle: done ? 'solid' : 'dashed' })}>{pattern[offset]}</span>
          })}
        </>}
        <span style={{ gridColumnStart: 1 }}>markers</span>
        {[...text].map((_, pos) => <span key={pos} style={{ ...strip({ border: 'none', fontSize: 11 }), color: step.marks[pos] ? 'var(--text)' : 'var(--text-muted)', fontWeight: step.marks[pos] ? 700 : 400 }}>{step.marks[pos] > 0 ? `+${step.marks[pos]}` : step.marks[pos] || '·'}</span>)}
      </div>
    </div>}

    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `72px repeat(${k}, ${CHAR}px)`, rowGap: 2, alignItems: 'center', fontSize: 12 }}>
        <span>pattern</span>
        {[...pattern].map((ch, i) => <span key={i} style={strip({ background: i === step.tableI ? 'var(--surface3)' : i === step.j && step.tableI >= 0 ? 'var(--surface2)' : 'transparent', outline: i === step.tableI ? '2px solid var(--primary)' : 'none', outlineOffset: -2 })}>{ch}</span>)}
        <span style={{ gridColumnStart: 1 }}>fail</span>
        {[...pattern].map((_, i) => <span key={i} style={strip({ border: 'none' })}>{i < step.failKnown ? step.fail[i] : '·'}</span>)}
      </div>
    </div>

    <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13 }}>
      <span>across matches: {step.hits.across}</span>
      <span>down matches: {step.hits.down}</span>
      {running !== null && <span>running sum: {running}</span>}
      <output aria-label="Doubly covered cells" style={{ fontWeight: 700 }}>count = {step.count}</output>
    </p>
  </section>
}
