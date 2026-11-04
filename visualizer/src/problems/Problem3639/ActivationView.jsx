import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'

const tint = (token, percent) => `color-mix(in srgb, var(${token}) ${percent}%, transparent)`
const CELL = 38

// Order timeline, the string with the current gap, the starts-by-ends rectangle behind the count, and progress to k.
export default function ActivationView({ run, step }) {
  const { s, order, k } = run.input
  const total = s.length * (s.length + 1) / 2
  return <section aria-label="String activation" style={{ display: 'grid', gap: 14, color: 'var(--text)', minWidth: 0 }}>
    <IndexedSequence label="order: which index each time step stars" length={order.length} valueAt={t => order[t]} active={step.t}
      roleAt={t => (step.history.some(row => row.t === t) ? 'starred' : '')} />
    <StringStrip s={s} step={step} />
    <Progress valid={step.valid} k={k} total={total} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <GainRectangle step={step} s={s} />
      <div style={{ flex: '1 1 280px', minWidth: 0, overflowX: 'auto' }}>
        <RecordStateTable label="Steps so far" columns={['t', 'order[t]', 'left', 'right', 'gain', 'valid']} rows={step.history} activeRow={step.history.findIndex(row => row.t === step.t)} />
      </div>
    </div>
  </section>
}

function StringStrip({ s, step }) {
  const n = s.length
  const starred = new Set(step.stars)
  const inGap = index => step.left !== null && index > step.left && index < step.right
  const box = { width: CELL, flex: `0 0 ${CELL}px`, textAlign: 'center', borderRadius: 6, padding: '3px 0', boxSizing: 'border-box' }
  const wall = (index, active) => <div data-wall={index} style={{ ...box, border: `2px ${active ? 'solid' : 'dashed'} ${active ? 'var(--warning)' : 'var(--border)'}`, color: 'var(--text-muted)' }}>
    <small>{index}</small><strong style={{ display: 'block' }}>|</strong><small style={{ display: 'block' }}>{active ? (index === -1 ? 'left' : 'right') : 'wall'}</small>
  </div>
  return <div style={{ overflowX: 'auto' }} aria-label="The string and its stars">
    <div style={{ display: 'flex', gap: 4, width: 'max-content' }}>
      {wall(-1, step.left === -1)}
      {[...s].map((letter, index) => {
        const isCurrent = index === step.i
        const isStar = starred.has(index)
        const tag = isCurrent ? 'new' : index === step.left ? 'left' : index === step.right ? 'right' : ' '
        return <div key={index} data-index={index} data-star={isStar} style={{
          ...box,
          border: `2px solid ${isCurrent ? 'var(--primary)' : index === step.left || index === step.right ? 'var(--warning)' : 'var(--border)'}`,
          background: isCurrent ? tint('--primary', 26) : isStar ? 'var(--surface3)' : inGap(index) ? tint('--primary', 10) : 'transparent',
        }}>
          <small>{index}</small><strong style={{ display: 'block' }}>{isStar ? '*' : letter}</strong><small style={{ display: 'block' }}>{tag}</small>
        </div>
      })}
      {wall(n, step.right === n)}
    </div>
  </div>
}

function Progress({ valid, k, total }) {
  const scale = Math.max(k, total, 1)
  const reached = valid >= k
  return <div aria-label="Valid substrings against the target">
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
      <span><strong>valid {valid}</strong> · target k = {k}</span>
      <span style={{ color: 'var(--text-muted)' }}>all substrings of s: {total}</span>
    </div>
    <div style={{ position: 'relative', height: 16, borderRadius: 8, background: 'var(--surface3)', marginTop: 4 }}>
      <div style={{ height: '100%', borderRadius: 8, width: `${(valid / scale) * 100}%`, background: reached ? 'var(--success)' : 'var(--primary)' }} />
      <div title={`k = ${k}`} style={{ position: 'absolute', top: -3, bottom: -3, left: `${(k / scale) * 100}%`, width: 3, marginLeft: -1.5, background: 'var(--text)' }} />
      {total < k && <div title={`all substrings = ${total}`} style={{ position: 'absolute', top: -3, bottom: -3, left: `${(total / scale) * 100}%`, width: 0, borderLeft: '2px dashed var(--text-muted)' }} />}
    </div>
  </div>
}

// Rows are start choices and columns are end choices, so the area is the number of new substrings.
function GainRectangle({ step, s }) {
  if (step.gain === null) return <p style={{ margin: 0, flex: '0 1 240px', color: 'var(--text-muted)' }}>Each new star adds a rectangle of substrings: possible starts by possible ends.</p>
  const starts = []
  const ends = []
  for (let a = step.left + 1; a <= step.i; a++) starts.push(a)
  for (let b = step.i; b < step.right; b++) ends.push(b)
  return <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
    <table style={{ borderCollapse: 'separate', borderSpacing: 2, fontSize: 12 }}>
      <caption style={{ textAlign: 'left', paddingBottom: 4, fontWeight: 700 }}>{starts.length} starts × {ends.length} ends = {step.gain} new</caption>
      <thead><tr><th scope="col" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>start \ end</th>{ends.map(b => <th key={b} scope="col" style={{ padding: '1px 4px' }}>{b}</th>)}</tr></thead>
      <tbody>{starts.map(a => <tr key={a}>
        <th scope="row" style={{ padding: '1px 4px' }}>{a}</th>
        {ends.map(b => <td key={b} title={`substring ${a} to ${b}: ${s.slice(a, b + 1)}`} style={{ minWidth: 42, padding: '3px 2px', textAlign: 'center', borderRadius: 4, background: tint('--primary', 22), color: 'var(--text)' }}>{a}–{b}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}
