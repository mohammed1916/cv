const CELL = 66
const PAD = 24
const verdictTone = { open: 'var(--success)', visited: 'var(--error)', wrong: 'var(--error)', dead: 'var(--warning)', untried: 'var(--text-muted)' }
const verdictText = { open: 'going', visited: 'on path', wrong: 'wrong number', dead: 'dead end', untried: 'not tried' }

function Board({ grid, step }) {
  const m = grid.length
  const n = grid[0].length
  const width = n * CELL + PAD * 2
  const height = m * CELL + PAD * 2
  const centre = ([r, c]) => [PAD + c * CELL + CELL / 2, PAD + r * CELL + CELL / 2]
  const order = new Map(step.path.map(([r, c], i) => [`${r}:${c}`, i + 1]))
  const onAt = step.at ? `${step.at[0]}:${step.at[1]}` : ''
  return <svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ maxWidth: '100%', display: 'block' }} role="img" aria-label={`Grid with ${step.path.length} cells on the current path`}>
    <defs><marker id="p3565-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--primary)" /></marker></defs>
    {Array.from({ length: n }, (_, c) => <text key={`c${c}`} x={PAD + c * CELL + CELL / 2} y={16} textAnchor="middle" fontSize="11" fill="var(--text-muted)">{c}</text>)}
    {Array.from({ length: m }, (_, r) => <text key={`r${r}`} x={10} y={PAD + r * CELL + CELL / 2 + 4} textAnchor="middle" fontSize="11" fill="var(--text-muted)">{r}</text>)}
    {grid.flatMap((row, r) => row.map((value, c) => {
      const key = `${r}:${c}`
      const place = order.get(key)
      const isProbe = step.probe && step.probe.r === r && step.probe.c === c
      const isNeeded = value > 0 && value === step.need
      return <g key={key} data-cell={key} data-order={place ?? ''}>
        <rect x={PAD + c * CELL + 2} y={PAD + r * CELL + 2} width={CELL - 4} height={CELL - 4} rx={8}
          fill={place ? 'var(--primary-glow)' : 'var(--surface2)'}
          stroke={key === onAt ? 'var(--primary)' : isProbe ? verdictTone[step.probe.verdict] : 'var(--border)'}
          strokeWidth={key === onAt || isProbe ? 3 : 1} strokeDasharray={isProbe ? '6 4' : undefined} />
        {value > 0 && <text x={PAD + c * CELL + CELL / 2} y={PAD + r * CELL + CELL / 2 + 8} textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--text)" textDecoration={isNeeded ? 'underline' : undefined}>{value}</text>}
        {place && <text x={PAD + c * CELL + 9} y={PAD + r * CELL + 18} fontSize="11" fill="var(--text-muted)">#{place}</text>}
      </g>
    }))}
    {step.path.slice(1).map((cell, i) => {
      const [x1, y1] = centre(step.path[i])
      const [x2, y2] = centre(cell)
      const inset = 14
      const dx = Math.sign(x2 - x1) * inset
      const dy = Math.sign(y2 - y1) * inset
      return <line key={i} x1={x1 + dx} y1={y1 + dy} x2={x2 - dx} y2={y2 - dy} stroke="var(--primary)" strokeWidth="3" markerEnd="url(#p3565-head)" />
    })}
  </svg>
}

function NumberRail({ k, need }) {
  return <ol aria-label="Numbers in the required order" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
    {Array.from({ length: k }, (_, i) => {
      const value = i + 1
      const met = value < need
      const next = value === need
      return <li key={value} data-number={value} data-state={met ? 'met' : next ? 'next' : 'later'} style={{ minWidth: 34, padding: '3px 8px', textAlign: 'center', borderRadius: 6, color: 'var(--text)', background: met ? 'var(--primary-glow)' : 'var(--surface2)', border: next ? '2px solid var(--primary)' : '1px solid var(--border)', fontWeight: next ? 700 : 400 }}>
        {value}<small style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>{met ? 'met' : next ? 'next' : 'later'}</small>
      </li>
    })}
  </ol>
}

// One row per recursive call: the live branch of the search tree together with what each call has ruled out.
function SearchLadder({ stack }) {
  if (!stack.length) return <p style={{ color: 'var(--text-muted)', margin: 0 }}>No call is active.</p>
  return <ol aria-label="Active search calls" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4, maxHeight: 320, overflow: 'auto' }}>
    {stack.map((entry, depth) => <li key={depth} data-depth={depth} style={{ marginLeft: Math.min(depth, 10) * 10, padding: '4px 8px', borderLeft: `3px solid ${depth === stack.length - 1 ? 'var(--primary)' : 'var(--border)'}`, background: 'var(--surface2)', borderRadius: 4, color: 'var(--text)' }}>
      <strong>({entry.r}, {entry.c})</strong>
      {entry.options.map(option => <span key={option.dir} data-status={option.status} style={{ display: 'inline-block', margin: '2px 0 2px 8px', padding: '0 6px', fontSize: 12, borderRadius: 4, color: 'var(--text)', border: `1px solid ${verdictTone[option.status]}`, opacity: option.status === 'untried' ? 0.65 : 1 }}>
        {option.dir}: {verdictText[option.status]}
      </span>)}
    </li>)}
  </ol>
}

export default function PathSearchView({ run, step }) {
  const { grid, k } = run.input
  const total = grid.length * grid[0].length
  const stat = { margin: 0, color: 'var(--text)' }
  return <section aria-label="Path search" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: 'var(--text)', alignItems: 'flex-start' }}>
    <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
      <Board grid={grid} step={step} />
      <NumberRail k={k} need={step.need} />
      <dl style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: 0 }}>
        <div><dt style={{ color: 'var(--text-muted)' }}>on path</dt><dd style={stat}>{step.path.length} / {total}</dd></div>
        <div><dt style={{ color: 'var(--text-muted)' }}>entries</dt><dd style={stat}>{step.entered}</dd></div>
        <div><dt style={{ color: 'var(--text-muted)' }}>step-backs</dt><dd style={stat}>{step.backtracks}</dd></div>
      </dl>
    </div>
    <div style={{ flex: '1 1 280px', minWidth: 0 }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 14, color: 'var(--text)' }}>Live branch of the search</h3>
      <SearchLadder stack={step.stack} />
      {step.phase === 'done' && <output aria-label="Result" style={{ display: 'block', marginTop: 10, color: 'var(--text)', overflowWrap: 'anywhere' }}>{run.result.length ? `Result: ${JSON.stringify(run.result)}` : 'Result: []'}</output>}
    </div>
  </section>
}
