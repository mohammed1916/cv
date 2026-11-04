const PITCH = 64
const CELL = 48
const ARC_H = 38
const TAG_H = 28
const CELL_Y = ARC_H + TAG_H
const GATE_Y = CELL_Y + CELL + 10
const GATE_H = 22
const BAND_1_Y = GATE_Y + GATE_H + 22
const BAND_2_Y = BAND_1_Y + 26

const center = i => i * PITCH + CELL / 2 + 8
const shade = { 1: 0, 2: 22, 3: 44 }
const fillFor = v => `color-mix(in srgb, var(--primary) ${shade[v]}%, var(--surface2))`

function Band({ from, to, y, label }) {
  return <g data-band={label}>
    <line x1={center(from)} y1={y} x2={center(to)} y2={y} stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
    <text x={center(from)} y={y - 7} fontSize="11" fill="var(--text)">{label}</text>
  </g>
}

function ReplayLadder({ rows, nums, locked, opened }) {
  const open = i => locked[i] === 0 || opened.includes(i)
  return <section aria-label="Swap replay" style={{ marginTop: 12 }}>
    <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Replay with those gates open: {rows.length - 1} swap{rows.length === 2 ? '' : 's'}</h3>
    <div style={{ maxHeight: 260, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {rows.map((row, r) => <div key={r} data-replay-row={r} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {row.values.map((v, i) => {
          const swapped = row.swapAt !== null && (i === row.swapAt || i === row.swapAt + 1)
          return <span key={i} style={{ width: 24, height: 24, lineHeight: '22px', textAlign: 'center', borderRadius: 4, color: 'var(--text)', background: fillFor(v), border: `2px solid ${swapped ? 'var(--primary)' : 'var(--border)'}`, fontWeight: swapped ? 700 : 400 }}>{v}</span>
        })}
        <small style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>{row.swapAt === null ? 'start' : `swap at gate ${row.swapAt}${open(row.swapAt) && locked[row.swapAt] ? ' (unlocked)' : ''}`}</small>
      </div>)}
    </div>
    <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Ends sorted: {[...nums].sort((a, b) => a - b).join(' ')}</p>
  </section>
}

// Locks sit between the cells they govern; the two bands cover exactly the gates a value must cross.
export default function GateBandView({ run, step }) {
  const { nums, locked } = run.input
  const n = nums.length
  const width = Math.max(n * PITCH + 16, 300)
  const height = BAND_2_Y + 14
  const opened = new Set(step.opened)
  const tags = i => [
    step.first2 === i && 'first 2', step.last1 === i && 'last 1',
    step.first3 === i && 'first 3', step.last2 === i && 'last 2',
  ].filter(Boolean)
  const showOneTwo = step.first2 !== null && step.last1 !== null && step.first2 < step.last1
  const showTwoThree = step.first3 !== null && step.last2 !== null && step.first3 < step.last2
  const arc = step.blocked ? { a: center(step.first3), b: center(step.last1) } : null
  return <section aria-label="Gates between neighbouring values" style={{ color: 'var(--text)' }}>
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Values with gates between them and required crossing bands" style={{ display: 'block' }}>
        {arc && <g data-blocked="true">
          <path d={`M ${arc.a} ${ARC_H} Q ${(arc.a + arc.b) / 2} -8 ${arc.b} ${ARC_H}`} fill="none" stroke="var(--error)" strokeWidth="2.5" strokeDasharray="5 4" />
          <text x={(arc.a + arc.b) / 2} y="12" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">3 can never pass this 1</text>
        </g>}
        {nums.map((v, i) => <g key={i} data-index={i}>
          {tags(i).map((tag, t) => <text key={tag} x={center(i)} y={CELL_Y - 4 - t * 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text)">{tag}</text>)}
          <rect x={center(i) - CELL / 2} y={CELL_Y} width={CELL} height={CELL} rx="7" fill={fillFor(v)} stroke={i === step.at ? 'var(--primary)' : 'var(--border)'} strokeWidth={i === step.at ? 3.5 : 1.5} />
          <text x={center(i)} y={CELL_Y + 30} textAnchor="middle" fontSize="19" fontWeight="700" fill="var(--text)">{v}</text>
          <text x={center(i)} y={CELL_Y + 12} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">[{i}]</text>
        </g>)}
        {nums.slice(0, -1).map((_, i) => {
          const isOpened = opened.has(i)
          const isLocked = locked[i] === 1 && !isOpened
          const isActive = step.gate === i
          const x = (center(i) + center(i + 1)) / 2
          const label = isOpened ? 'unlock' : isLocked ? 'lock' : 'open'
          return <g key={i} data-gate={i} data-state={label}>
            <line x1={x} y1={CELL_Y + CELL - 6} x2={x} y2={GATE_Y} stroke="var(--border)" strokeWidth="1.5" />
            <rect x={x - 22} y={GATE_Y} width="44" height={GATE_H} rx="11"
              fill={isOpened ? 'color-mix(in srgb, var(--success) 28%, var(--surface2))' : isLocked ? 'var(--surface3)' : 'var(--surface)'}
              stroke={isActive ? 'var(--primary)' : isOpened ? 'var(--success)' : 'var(--border)'} strokeWidth={isActive ? 3 : 1.5} strokeDasharray={isLocked || isOpened ? undefined : '3 3'} />
            <text x={x} y={GATE_Y + 15} textAnchor="middle" fontSize="11" fontWeight={isLocked || isOpened ? 700 : 400} fill="var(--text)">{label}</text>
          </g>
        })}
        {showOneTwo && <Band from={step.first2} to={step.last1} y={BAND_1_Y} label="a 2 must cross a 1" />}
        {showTwoThree && <Band from={step.first3} to={step.last2} y={BAND_2_Y} label="a 3 must cross a 2" />}
      </svg>
    </div>
    <dl style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '8px 0' }}>
      {[['first 2', step.first2], ['last 1', step.last1], ['first 3', step.first3], ['last 2', step.last2]].map(([name, value]) => <div key={name}><dt style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{name}</dt><dd style={{ margin: 0 }}>{value ?? 'absent'}</dd></div>)}
      <div><dt style={{ fontSize: 12, color: 'var(--text-secondary)' }}>unlocks</dt><dd style={{ margin: 0, fontWeight: 700 }}>{step.unlocks}{step.opened.length ? ` (gates ${step.opened.join(', ')})` : ''}</dd></div>
    </dl>
    <p style={{ margin: 0, fontSize: '0.85rem' }}>A gate sits between two cells: locked[i] controls the swap of i and i + 1. A band covers the gates something must pass through.</p>
    {step.replay && <ReplayLadder rows={step.replay} nums={nums} locked={locked} opened={step.opened} />}
  </section>
}
