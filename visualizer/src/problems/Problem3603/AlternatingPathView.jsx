const CELL = 92
const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]
const ARROW = { above: '↓', left: '→' }

function GridCell({ i, j, step, wait, isFirst, isLast }) {
  const value = step.cost[i][j]
  const [ci, cj] = step.cell ?? [-1, -1]
  const isCurrent = ci === i && cj === j
  const isAbove = isCurrent === false && step.above && ci === i + 1 && cj === j
  const isLeft = isCurrent === false && step.left && ci === i && cj === j + 1
  const onPath = step.path.some(cell => same(cell, [i, j]))
  const chosenSource = (isAbove && step.chosen === 'above') || (isLeft && step.chosen === 'left')
  const candidate = isAbove || isLeft
  const border = isCurrent ? 'var(--primary)' : chosenSource ? 'var(--success)' : candidate ? 'var(--warning)' : onPath ? 'var(--success)' : 'var(--border)'
  const background = onPath
    ? 'color-mix(in srgb, var(--success) 18%, var(--surface))'
    : isCurrent ? 'color-mix(in srgb, var(--primary) 16%, var(--surface))' : 'var(--surface)'
  const offer = isAbove ? step.above : isLeft ? step.left : null
  return <div data-row={i} data-column={j} data-cost={value ?? ''} aria-current={isCurrent ? 'step' : undefined}
    style={{ width: CELL, minHeight: 86, boxSizing: 'border-box', padding: 4, borderRadius: 6, border: `${isCurrent || candidate || onPath ? 3 : 1}px solid ${border}`, background, color: 'var(--text)', display: 'grid', gridTemplateRows: 'auto 1fr auto', fontSize: 11 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
      <span title="Cost to enter">in {(i + 1) * (j + 1)}</span>
      <span title="Cost to wait when leaving" style={isFirst || isLast ? { textDecoration: 'line-through' } : undefined}>wait {wait}</span>
    </div>
    <strong style={{ fontSize: 20, textAlign: 'center', alignSelf: 'center' }}>{value ?? '·'}</strong>
    <div style={{ textAlign: 'center', minHeight: 15, fontWeight: 600, color: chosenSource ? 'var(--success)' : 'var(--warning)' }}>{offer ? `${offer.cost} + ${offer.wait} = ${offer.total}` : ' '}</div>
  </div>
}

// One row of the grid plus the arrows that record which way into each cell won.
function Grid({ run, step }) {
  const { m, n, waitCost } = run.input
  const across = (i, j) => step.from[i][j] === 'left'
  const down = (i, j) => step.from[i][j] === 'above'
  const onPathStep = (a, b) => {
    const at = step.path.findIndex(cell => same(cell, a))
    return at >= 0 && same(step.path[at + 1], b)
  }
  const arrowStyle = active => ({ color: active ? 'var(--success)' : 'var(--text-muted)', fontWeight: active ? 700 : 400, fontSize: active ? 18 : 14, textAlign: 'center' })
  return <div style={{ overflowX: 'auto' }}>
    <div role="grid" aria-label="Cheapest total per cell" style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${CELL}px ${n > 1 ? '18px' : ''})`, alignItems: 'center', width: 'max-content' }}>
      {Array.from({ length: m }).map((_, i) => <RowCells key={i} i={i} n={n} m={m} step={step} waitCost={waitCost} across={across} down={down} onPathStep={onPathStep} arrowStyle={arrowStyle} />)}
    </div>
  </div>
}

function RowCells({ i, n, m, step, waitCost, across, down, onPathStep, arrowStyle }) {
  const cells = []
  for (let j = 0; j < n; j++) {
    cells.push(<GridCell key={`c${j}`} i={i} j={j} step={step} wait={waitCost[i][j]} isFirst={i === 0 && j === 0} isLast={i === m - 1 && j === n - 1} />)
    if (n > 1) cells.push(<div key={`h${j}`} aria-hidden="true" style={arrowStyle(j + 1 < n && onPathStep([i, j], [i, j + 1]))}>{j + 1 < n && across(i, j + 1) ? ARROW.left : ' '}</div>)
  }
  if (i + 1 < m) {
    for (let j = 0; j < n; j++) {
      cells.push(<div key={`v${j}`} aria-hidden="true" style={{ ...arrowStyle(onPathStep([i, j], [i + 1, j])), height: 18, lineHeight: '18px' }}>{down(i + 1, j) ? ARROW.above : ' '}</div>)
      if (n > 1) cells.push(<div key={`g${j}`} />)
    }
  }
  return <>{cells}</>
}

const KIND = {
  enter: { label: 'enter', color: 'var(--primary)' },
  move: { label: 'move', color: 'var(--info)' },
  wait: { label: 'wait', color: 'var(--warning)' },
}

function Ledger({ step }) {
  if (!step.ledger.length) {
    return <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Each number is the cheapest total to step into that cell. Moves and waits alternate, so the wait of the cell you leave is paid before the next entry.</p>
  }
  return <ol aria-label="Walk, second by second" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'stretch' }}>
    {step.ledger.map((entry, index) => <li key={index} style={{ padding: '3px 8px', borderRadius: 6, border: `2px solid ${KIND[entry.kind].color}`, background: 'var(--surface2)', color: 'var(--text)', fontSize: 12 }}>
      <small style={{ display: 'block', color: 'var(--text-muted)' }}>{entry.second === null ? 'begin' : `second ${entry.second}`}</small>
      <span>{KIND[entry.kind].label} ({entry.at[0]}, {entry.at[1]})</span> <strong>+{entry.amount}</strong>
    </li>)}
    <li style={{ padding: '3px 8px', alignSelf: 'center', color: 'var(--text)' }}>= <strong>{step.total}</strong></li>
  </ol>
}

export default function AlternatingPathView({ run, step }) {
  return <section aria-label="Alternating walk costs" style={{ display: 'grid', gap: 10, color: 'var(--text)' }}>
    <Grid run={run} step={step} />
    <Ledger step={step} />
  </section>
}
