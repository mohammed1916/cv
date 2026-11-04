const CELL = 54, GAP = 4
const center = i => i * (CELL + GAP) + CELL / 2
const OUTLINE = { push: 'var(--success)', dominated: 'var(--warning)', blocked: 'var(--error)' }
const KIND = { X: 'wall', R: 'reset', L: 'litter', S: 'start', '.': '' }

// The grid carries the route to the current state, the neighbour being tried, and the best energy per cell for this litter set.
// The side shows what makes a state different from a cell: energy, remaining litter, and the queue.
export default function ClassroomSearchView({ run, step }) {
  const { classroom, energy } = run.input
  const { litter } = run
  const m = classroom.length, n = classroom[0].length
  const collected = (r, c) => {
    const index = litter.findIndex(([a, b]) => a === r && b === c)
    return index >= 0 && !(step.mask >> index & 1)
  }
  const points = step.route.map(([r, c]) => `${center(c)},${center(r)}`).join(' ')
  const { candidate } = step
  const inGrid = candidate && candidate.r >= 0 && candidate.r < m && candidate.c >= 0 && candidate.c < n
  const width = n * (CELL + GAP) - GAP, height = m * (CELL + GAP) - GAP
  return <section aria-label="Classroom search" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, color: 'var(--text)', alignItems: 'flex-start' }}>
    <div style={{ position: 'relative', width, height, flex: 'none' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${CELL}px)`, gap: GAP }}>
        {classroom.flatMap((row, r) => [...row].map((ch, c) => {
          const here = step.at[0] === r && step.at[1] === c
          const isCandidate = inGrid && candidate.r === r && candidate.c === c
          const gone = ch === 'L' && collected(r, c)
          const seen = step.best[r][c]
          return <div key={`${r},${c}`} data-cell={`${r},${c}`} data-kind={ch} data-current={here} data-candidate={isCandidate ? candidate.kind : undefined}
            style={{ width: CELL, height: CELL, boxSizing: 'border-box', borderRadius: 6, position: 'relative', textAlign: 'center',
              background: here ? 'var(--primary-glow)' : ch === 'X' ? 'var(--surface3)' : ch === 'L' && !gone ? 'var(--warning-glow)' : ch === 'R' ? 'var(--success-glow)' : 'var(--surface)',
              border: isCandidate ? `3px dashed ${OUTLINE[candidate.kind]}` : here ? '3px solid var(--primary)' : '1px solid var(--border)' }}>
            <strong style={{ display: 'block', lineHeight: '20px', marginTop: 4, textDecoration: gone ? 'line-through' : 'none', color: ch === 'X' || gone ? 'var(--text-muted)' : 'var(--text)' }}>{ch === '.' ? '' : ch}</strong>
            <small style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>{gone ? 'collected' : KIND[ch]}</small>
            {seen !== null && <span title={`Best energy here: ${seen}`} style={{ position: 'absolute', right: 3, bottom: 1, fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{seen}</span>}
          </div>
        }))}
      </div>
      <svg width={width} height={height} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {step.route.length > 1 && <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" opacity="0.75" />}
        {inGrid && <line x1={center(step.at[1])} y1={center(step.at[0])} x2={center(candidate.c)} y2={center(candidate.r)} stroke={OUTLINE[candidate.kind]} strokeWidth="3" strokeDasharray="5 4" />}
      </svg>
    </div>
    <div style={{ display: 'grid', gap: 12, minWidth: 220, flex: '1 1 220px', fontSize: 13 }}>
      <div aria-label={`Energy ${step.left} of ${energy}`}>
        <strong>Energy {step.left} / {energy}</strong>
        <div style={{ display: 'flex', gap: 2, marginTop: 4, flexWrap: 'wrap' }}>
          {energy <= 25 ? Array.from({ length: energy }, (_, i) => <span key={i} style={{ width: 10, height: 14, borderRadius: 2, border: '1px solid var(--border)', background: i < step.left ? 'var(--success)' : 'var(--surface2)' }} />)
            : <div style={{ width: 200, height: 14, background: 'var(--surface2)', borderRadius: 3 }}><div style={{ width: `${(step.left / energy) * 100}%`, height: '100%', background: 'var(--success)', borderRadius: 3 }} /></div>}
        </div>
      </div>
      <div><strong>Moves {step.moves}</strong> · <span>{step.states} states queued so far</span></div>
      {litter.length > 0 && <div><strong>Litter left</strong>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>{litter.map(([r, c], index) => {
          const left = step.mask >> index & 1
          return <span key={index} data-litter={index} data-left={Boolean(left)} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)', background: left ? 'var(--warning-glow)' : 'var(--surface2)', textDecoration: left ? 'none' : 'line-through', color: left ? 'var(--text)' : 'var(--text-muted)' }}>#{index} ({r},{c})</span>
        })}</div>
      </div>}
      {step.candidate && <div data-trying={step.candidate.kind}><strong>Trying:</strong> {step.candidate.kind === 'blocked' ? 'blocked' : `energy ${step.candidate.left} here`}{step.candidate.kind === 'dominated' ? ', already beaten' : ''}{step.candidate.kind === 'push' ? ', queued' : ''}</div>}
      <div><strong>Queue ({step.queueSize})</strong>
        <ol style={{ margin: '4px 0 0', paddingLeft: 20 }}>{step.queue.map((state, i) => <li key={i}>({state.r},{state.c}), energy {state.left}, moves {state.moves}, litter left {litter.filter((_, b) => state.mask >> b & 1).length}</li>)}</ol>
        {step.queueSize > step.queue.length && <small style={{ color: 'var(--text-muted)' }}>and {step.queueSize - step.queue.length} more</small>}
      </div>
      {step.layers.length > 0 && <div><strong>Copies of the room</strong>
        <div style={{ color: 'var(--text-muted)' }}>Each remaining-litter set is its own copy of the grid.</div>
        <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>{step.layers.map(layer => <li key={layer.mask} style={{ fontWeight: layer.mask === step.mask ? 700 : 400 }}>{litter.filter((_, b) => layer.mask >> b & 1).length} left, set {layer.mask.toString(2).padStart(litter.length, '0')}: {layer.cells} cells reached</li>)}</ul>
      </div>}
    </div>
  </section>
}
