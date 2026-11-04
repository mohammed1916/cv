import IndexedSequence from '../../components/shared/IndexedSequence'
import { bitWidth } from './algorithm'

const tint = (color, percent) => `color-mix(in srgb, ${color} ${percent}%, transparent)`
const CELL = 30

const bitOf = (value, column) => (value >>> column) & 1

// One bit column per position, labelled rows on the left and the decimal value on the right.
function BitTable({ width, hasSign, rows, pick, title }) {
  const columns = Array.from({ length: width }, (_, i) => width - 1 - i)
  const isPick = column => pick !== null && pick !== undefined && bitOf(pick, column) === 1
  const head = column => (hasSign && column === width - 1 ? `${column}+` : column)
  return <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
    <table aria-label={title} style={{ borderCollapse: 'separate', borderSpacing: 3, color: 'var(--text)' }}>
      <caption style={{ textAlign: 'left', fontWeight: 600, marginBottom: 4 }}>{title}</caption>
      <thead><tr>
        <th scope="col" style={{ textAlign: 'left', fontSize: 12, color: 'var(--text-muted)' }}>bit</th>
        {columns.map(column => <th scope="col" key={column} style={{ width: CELL, fontSize: 11, color: isPick(column) ? 'var(--warning)' : 'var(--text-muted)', fontWeight: isPick(column) ? 700 : 400 }}>{head(column)}</th>)}
        <th scope="col" style={{ textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', paddingLeft: 8 }}>value</th>
      </tr></thead>
      <tbody>{rows.map(row => <tr key={row.label} data-row={row.label}>
        <th scope="row" style={{ textAlign: 'left', fontWeight: 600, paddingRight: 8, whiteSpace: 'nowrap' }}>{row.label}</th>
        {columns.map(column => {
          const text = row.cell ? row.cell(column) : bitOf(row.value, column)
          const changed = row.prev !== undefined && bitOf(row.prev, column) !== bitOf(row.value, column)
          const lit = text !== 0
          return <td key={column} data-bit={column} data-changed={changed || undefined} style={{
            width: CELL, height: CELL, textAlign: 'center', borderRadius: 5,
            border: `${changed ? 2 : 1}px solid ${changed ? 'var(--primary)' : isPick(column) ? 'var(--warning)' : 'var(--border)'}`,
            background: lit ? tint(row.color, 26) : 'var(--surface2)',
            fontWeight: lit ? 700 : 400, color: lit ? 'var(--text)' : 'var(--text-muted)',
          }}>{text}</td>
        })}
        <td style={{ paddingLeft: 8, whiteSpace: 'nowrap' }}>{row.showValue === false ? '' : row.value}</td>
      </tr>)}</tbody>
    </table>
  </div>
}

function GroupPanel({ index, group, width, hasSign, step }) {
  const active = step.group === index
  const prev = active && step.phase === 'group'
  return <section aria-label={`Group ${index}`} style={{ border: `${active ? 2 : 1}px solid ${active ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, padding: 10, background: 'var(--surface)', minWidth: 0 }}>
    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Group {index}: picked bit is {index}</p>
    <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text-muted)' }}>Seen: {group.members.length ? group.members.join(', ') : 'nothing yet'}</p>
    <BitTable width={width} hasSign={hasSign} pick={step.pick} title={`Counters for group ${index}`} rows={[
      { label: 'ones', value: group.ones, prev: prev ? step.prevOnes : undefined, color: 'var(--success)' },
      { label: 'twos', value: group.twos, prev: prev ? step.prevTwos : undefined, color: 'var(--info)' },
    ]} />
  </section>
}

// Bit columns as modulo-3 counters, then the same counters run separately on two groups.
export default function BitCounterView({ run, step }) {
  const { nums } = run.input
  const width = bitWidth(nums)
  const hasSign = nums.some(v => v < 0)
  const secondPass = step.pass === 2 || step.phase === 'decode' || step.phase === 'done'
  const groupOf = v => (step.pick !== null && (v & step.pick) !== 0 ? 1 : 0)
  const roleAt = i => {
    if (step.pass !== 2 || i > step.at) return ''
    return `group ${groupOf(nums[i])}`
  }
  const first = step.firstPass ?? { ones: step.ones, twos: step.twos }
  const counterRows = []
  if (step.pass === 1 && step.v !== null) counterRows.push({ label: 'v', value: step.v, color: 'var(--warning)' })
  counterRows.push(
    { label: 'ones', value: first.ones, prev: step.phase === 'count' ? step.prevOnes : undefined, color: 'var(--success)' },
    { label: 'twos', value: first.twos, prev: step.phase === 'count' ? step.prevTwos : undefined, color: 'var(--info)' },
    { label: 'count mod 3', value: 0, showValue: false, color: 'var(--primary)', cell: column => bitOf(first.ones, column) + 2 * bitOf(first.twos, column) },
  )
  if (step.diff !== null) counterRows.push({ label: 'differ', value: step.diff, color: 'var(--warning)' })
  if (step.pick !== null) counterRows.push({ label: 'picked', value: step.pick, color: 'var(--warning)' })
  if (step.x !== null) counterRows.push({ label: 'once', value: step.x, color: 'var(--success)' }, { label: 'twice', value: step.y, color: 'var(--info)' })

  return <section aria-label="Bit counters" style={{ color: 'var(--text)' }}>
    <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.at} roleAt={roleAt} />
    {step.x !== null && <p data-testid="once-twice-answer" style={{ margin: '8px 0', fontWeight: 600 }}>Once: {step.x} · Twice: {step.y}</p>}
    <div style={{ marginTop: 10 }}>
      <BitTable width={width} hasSign={hasSign} pick={step.pick} title={secondPass ? 'First pass result' : 'Column counters'} rows={counterRows} />
    </div>
    {secondPass && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginTop: 12 }}>
      <GroupPanel index={0} group={step.groups[0]} width={width} hasSign={hasSign} step={step} />
      <GroupPanel index={1} group={step.groups[1]} width={width} hasSign={hasSign} step={step} />
    </div>}
    {hasSign && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 0 }}>The leftmost column is the sign bit and stands for it and every higher bit (two's complement).</p>}
  </section>
}
