import IndexedSequence from '../../components/shared/IndexedSequence'

const ROW = 46, W = 430, LEFT = 22, BOX = 76, RIGHT = W - LEFT - BOX

// Previous row on the left, new row on the right; each arrow is one "times x mod k" move.
function FlowDiagram({ step, k }) {
  const previous = step.previous
  const row = step.row ?? Array(k).fill(0)
  const y = r => 28 + r * ROW
  const H = 28 + (k + 1) * ROW
  const hasValue = step.x !== null
  const stroke = active => active ? 'var(--primary)' : 'var(--border)'
  const box = (x, top, label, value, tone, key) => <g key={key} data-box={key}>
    <rect x={x} y={top} width={BOX} height={ROW - 12} rx={6} fill="var(--surface2)" stroke={tone} strokeWidth={tone === 'var(--border)' ? 1 : 3} />
    <text x={x + 8} y={top + 21} fontSize="12" fill="var(--text-muted)">{label}</text>
    <text x={x + BOX - 8} y={top + 22} fontSize="16" fontWeight="700" textAnchor="end" fill="var(--text)">{value}</text>
  </g>
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="How the blocks move between remainders" style={{ width: '100%', maxWidth: W, display: 'block' }}>
    <defs>
      <marker id="p3524-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--primary)" /></marker>
    </defs>
    <text x={LEFT} y={14} fontSize="12" fill="var(--text)">ending at previous index</text>
    <text x={RIGHT + BOX} y={14} fontSize="12" fill="var(--text)" textAnchor="end">ending here</text>
    {hasValue && Array.from({ length: k }, (_, r) => {
      const to = r * step.x % k
      const active = step.move?.from === r
      return <line key={r} data-arrow={`${r}-${to}`} data-active={active} x1={LEFT + BOX} y1={y(r) + 17} x2={RIGHT - 2} y2={y(to) + 17}
        stroke={stroke(active)} strokeWidth={active ? 3 : 1} strokeDasharray={!active && previous[r] === 0 ? '3 4' : undefined} markerEnd={active ? 'url(#p3524-arrow)' : undefined} />
    })}
    {step.single && <line data-arrow="single" x1={LEFT + BOX} y1={y(k) + 17} x2={RIGHT - 2} y2={y(step.xMod) + 17} stroke="var(--primary)" strokeWidth={3} markerEnd="url(#p3524-arrow)" />}
    {previous.map((value, r) => box(LEFT, y(r), `r=${r}`, value, step.move?.from === r ? 'var(--primary)' : 'var(--border)', `prev-${r}`))}
    {row.map((value, r) => box(RIGHT, y(r), `r=${r}`, value, step.move?.to === r || (step.single && step.xMod === r) ? 'var(--primary)' : 'var(--border)', `row-${r}`))}
    {hasValue && box(LEFT, y(k), 'alone', 1, step.single ? 'var(--primary)' : 'var(--border)', 'alone')}
  </svg>
}

function History({ step, nums, k }) {
  return <div style={{ overflowX: 'auto' }}>
    <table aria-label="Blocks ending at each index, by remainder" style={{ borderCollapse: 'collapse', fontSize: 13 }}>
      <caption style={{ textAlign: 'left', fontWeight: 700, paddingBottom: 4 }}>Blocks ending at each index, by remainder</caption>
      <thead><tr><th scope="col" style={{ padding: '2px 8px' }}>index, x</th>{Array.from({ length: k }, (_, r) => <th key={r} scope="col" style={{ padding: '2px 8px' }}>r={r}</th>)}</tr></thead>
      <tbody>{nums.map((x, i) => <tr key={i} aria-current={i === step.i ? 'true' : undefined}>
        <th scope="row" style={{ padding: '2px 8px', textAlign: 'left', fontWeight: i === step.i ? 700 : 400 }}>{i}, {x}</th>
        {Array.from({ length: k }, (_, r) => {
          const target = i === step.i && (step.move?.to === r || (step.single && step.xMod === r))
          const source = i === step.i - 1 && step.move?.from === r
          return <td key={r} data-cell={`${i},${r}`} data-role={target ? 'target' : source ? 'source' : ''} style={{
            padding: '2px 8px', textAlign: 'center', border: `${target || source ? 2 : 1}px solid ${target ? 'var(--primary)' : source ? 'var(--success)' : 'var(--border)'}`,
          }}>{step.table[i][r] ?? '·'}</td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

// The array, the remainder flow, which real blocks sit in each bucket, the history and the totals.
export default function RemainderFlowView({ run, step }) {
  const { nums, k } = run.input
  const blocks = step.rowBlocks ?? step.previousBlocks
  return <section aria-label="Remainder counts" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <IndexedSequence label={step.x === null ? `nums, k = ${k}` : `nums, k = ${k}, x mod k = ${step.xMod}`} length={nums.length} valueAt={i => nums[i]} active={step.i} roleAt={i => (step.i >= 0 && i < step.i ? 'done' : '')} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
        <FlowDiagram step={step} k={k} />
      </div>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <strong>The blocks themselves, ending {step.row ? 'here' : 'at the previous index'}</strong>
        {blocks.map((bucket, r) => <div key={r} data-bucket={r} style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginTop: 4 }}>
          <small style={{ color: 'var(--text-muted)', minWidth: 26 }}>r={r}</small>
          {bucket.length ? bucket.map(block => <code key={block.start} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '0 5px', background: 'var(--surface2)', overflowWrap: 'anywhere' }}>{block.text}</code>) : <small style={{ color: 'var(--text-muted)' }}>none</small>}
        </div>)}
      </div>
    </div>
    <History step={step} nums={nums} k={k} />
    <div role="group" aria-label="Running totals" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      <strong>Totals</strong>
      {step.totals.map((total, r) => <span key={r} data-total={r} style={{ border: `2px solid ${step.tallied ? 'var(--success)' : 'var(--border)'}`, borderRadius: 6, padding: '2px 10px', background: 'var(--surface2)' }}>x={r}: <b>{total}</b></span>)}
    </div>
  </section>
}
