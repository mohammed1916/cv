import RecordStateTable from '../../components/shared/RecordStateTable'

const tint = (color, percent) => `color-mix(in srgb, ${color} ${percent}%, transparent)`
const box = { border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface2)', color: 'var(--text)' }

// The array split into left zone, middle and right zone, with every copy of the middle value marked.
function Zones({ nums, at, x }) {
  return <div role="list" aria-label="nums split around the middle" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
    {nums.map((v, i) => {
      const zone = at < 0 ? 'none' : i < at ? 'left' : i === at ? 'middle' : 'right'
      const same = at >= 0 && v === x && i !== at
      const background = zone === 'middle' ? tint('var(--warning)', 40) : zone === 'left' ? tint('var(--info)', 16) : zone === 'right' ? tint('var(--success)', 16) : 'var(--surface2)'
      return <div role="listitem" key={i} data-index={i} data-zone={zone} data-same={same || undefined} style={{
        ...box, width: 44, textAlign: 'center', padding: '3px 0', background,
        border: `2px ${same ? 'solid var(--warning)' : zone === 'middle' ? 'solid var(--warning)' : 'solid transparent'}`,
      }}>
        <small style={{ display: 'block', color: 'var(--text-muted)' }}>[{i}]</small>
        <strong>{v}</strong>
        <small style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>{zone === 'middle' ? 'middle' : zone === 'none' ? ' ' : zone}</small>
      </div>
    })}
  </div>
}

function Frequencies({ freq, x }) {
  const top = Math.max(1, ...freq.map(f => Math.max(f.left, f.right)))
  const bar = (count, color) => <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <span aria-hidden="true" style={{ display: 'inline-block', height: 10, width: `${(count / top) * 70}px`, background: color, borderRadius: 2 }} />
    <span>{count}</span>
  </div>
  return <table aria-label="Value counts on each side" style={{ borderCollapse: 'collapse', color: 'var(--text)', fontSize: 14 }}>
    <caption style={{ textAlign: 'left', fontWeight: 600, marginBottom: 4 }}>Counts on each side</caption>
    <thead><tr style={{ color: 'var(--text-muted)' }}><th scope="col" style={{ textAlign: 'left', paddingRight: 10 }}>value</th><th scope="col" style={{ textAlign: 'left', minWidth: 96 }}>left</th><th scope="col" style={{ textAlign: 'left', minWidth: 96 }}>right</th></tr></thead>
    <tbody>{freq.map(f => <tr key={f.value} data-value={f.value} style={{ background: f.value === x ? tint('var(--warning)', 18) : 'transparent' }}>
      <th scope="row" style={{ textAlign: 'left', paddingRight: 10 }}>{f.value}</th>
      <td>{bar(f.left, 'var(--info)')}</td>
      <td>{bar(f.right, 'var(--success)')}</td>
    </tr>)}</tbody>
  </table>
}

// Nine cells: how many extra copies of x are taken from each side. Colour says which cells can work.
function CaseGrid({ cases, x, phase }) {
  const verdict = (a, b) => (a + b >= 2 ? 'good' : a + b === 0 ? 'never' : 'partial')
  const tone = { good: 'var(--success)', partial: 'var(--warning)', never: 'var(--error)' }
  const note = (a, b) => {
    if (a + b >= 2) return `${x} appears ${a + b + 1} times`
    if (a + b === 0) return `${x} appears once: always tied`
    const valid = a === 1 ? cases.oneLeft : cases.oneRight
    return valid === null ? 'others must all differ' : `${valid} have all different others`
  }
  const lit = (a, b) => (phase === 'many' && a + b >= 2) || (phase === 'oneLeft' && a === 1 && b === 0) || (phase === 'oneRight' && a === 0 && b === 1) || phase === 'add'
  return <div style={{ overflowX: 'auto' }}>
    <table aria-label="Cases by copies of x" style={{ borderCollapse: 'separate', borderSpacing: 4, color: 'var(--text)' }}>
      <caption style={{ textAlign: 'left', fontWeight: 600, marginBottom: 4 }}>Picks by how many other {x}s are chosen</caption>
      <thead><tr>
        <th scope="col" style={{ fontSize: 12, color: 'var(--text-muted)' }}>left \ right</th>
        {[0, 1, 2].map(b => <th scope="col" key={b} style={{ fontSize: 13 }}>{b} from right</th>)}
      </tr></thead>
      <tbody>{[0, 1, 2].map(a => <tr key={a}>
        <th scope="row" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{a} from left</th>
        {[0, 1, 2].map(b => {
          const kind = verdict(a, b)
          const on = lit(a, b)
          return <td key={b} data-case={`${a},${b}`} data-kind={kind} data-lit={on || undefined} style={{
            minWidth: 104, padding: '6px 8px', borderRadius: 6, textAlign: 'center', verticalAlign: 'top',
            background: tint(tone[kind], on ? 30 : 10), border: `${on ? 2 : 1}px solid ${on ? tone[kind] : 'var(--border)'}`,
          }}>
            <strong style={{ display: 'block' }}>{cases.raw[a][b]} picks</strong>
            <small style={{ color: 'var(--text-muted)' }}>{note(a, b)}</small>
          </td>
        })}
      </tr>)}</tbody>
    </table>
    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>All picks around this middle: {cases.total}. With {x}: {cases.lx} on the left, {cases.rx} on the right. Without {x}: {cases.la} on the left, {cases.ra} on the right.</p>
  </div>
}

// The formula's running sums, so the jump from counts to O(1) arithmetic stays visible.
function Totals({ totals }) {
  const items = [
    ['Σ L²', totals.sumL2], ['Σ R²', totals.sumR2], ['Σ L·R', totals.lr], ['Σ L·R²', totals.lr2], ['Σ L²·R', totals.l2r],
  ]
  return <div aria-label="Running sums over all values" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {items.map(([name, value]) => <span key={name} data-total={name} style={{ ...box, padding: '2px 8px', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>{name} = </span><strong>{value}</strong></span>)}
  </div>
}

export default function MiddleModeView({ run, step }) {
  const { nums } = run.input
  const { rows, cases, x, at, phase } = step
  return <section aria-label="Unique middle mode counting" style={{ color: 'var(--text)', display: 'grid', gap: 12 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <span style={{ ...box, padding: '3px 10px', borderColor: 'var(--success)' }}>Answer so far: <strong data-testid="middle-mode-answer">{step.answer}</strong></span>
      {step.gained !== null && <span style={{ ...box, padding: '3px 10px' }}>This middle adds: <strong>{step.gained}</strong></span>}
    </div>
    <Zones nums={nums} at={at} x={x} />
    {cases && <CaseGrid cases={cases} x={x} phase={phase} />}
    {rows && rows.list.length > 0 && <RecordStateTable
      label={`Extra ${x} from the ${rows.side}: choose one other value there, then a differing pair from the ${rows.side === 'left' ? 'right' : 'left'} that avoids both`}
      columns={['other value', 'copies', 'differing pairs', 'picks']}
      rows={rows.list.map(row => ({ 'other value': row.other, copies: row.copies, 'differing pairs': row.pairs, picks: row.ways }))} />}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <Frequencies freq={step.freq} x={x} />
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Running sums</p>
        <Totals totals={step.totals} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>These five totals replace the per-value table above, so each middle takes constant time on a full-sized array.</p>
      </div>
    </div>
  </section>
}
