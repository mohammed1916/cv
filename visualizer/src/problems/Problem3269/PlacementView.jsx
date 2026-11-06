import DPDependencyView from '../../components/shared/DPDependencyView'

const COLORS = { 1: '--primary', 2: '--success' }
const tint = token => `color-mix(in srgb, var(${token}) 24%, var(--surface))`
const box = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, overflowX: 'auto', color: 'var(--text)' }
const heading = { margin: '0 0 8px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }

function Lane({ name, bits, placed, which, lastIndex }) {
  return <div data-lane={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
    <strong style={{ width: 52, flex: 'none', color: `var(${COLORS[which]})` }}>{name}</strong>
    {bits.length === 0 && <span style={{ color: 'var(--text-muted)' }}>empty</span>}
    {bits.map((bit, index) => {
      const value = placed[index] ?? null
      const isLast = index === lastIndex
      return <div key={index} data-index={index} data-value={value ?? undefined} style={{ width: 46, flex: 'none', textAlign: 'center', borderRadius: 6, padding: '3px 0', border: `${isLast ? 2 : 1}px ${value === null ? 'dashed' : 'solid'} ${value === null ? 'var(--border)' : `var(${COLORS[which]})`}`, background: value === null ? 'transparent' : tint(COLORS[which]) }}>
        <small style={{ display: 'block', color: 'var(--text-muted)' }}>{isLast ? `${which === 1 ? 'i' : 'j'} = ${index + 1}` : (bit === 0 ? 'even' : 'odd')}</small>
        <strong>{value ?? '·'}</strong>
      </div>
    })}
  </div>
}

// DP table above; underneath, the real integers behind the active cell on two lanes and a number line.
export default function PlacementView({ run, step }) {
  const { nums1, nums2 } = run.input
  const { a, b } = step.placement
  const [i, j] = step.target
  const owner = new Map()
  a.forEach((value, index) => owner.set(value, { which: 1, label: `nums1[${index}]` }))
  b.forEach((value, index) => owner.set(value, { which: 2, label: `nums2[${index}]` }))
  const top = Math.max(1, step.values[i][j] ?? 0, ...owner.keys())
  const labels = {
    rows: ['none', ...nums1.map((bit, index) => `${index + 1} of nums1 (${bit})`)],
    columns: ['none', ...nums2.map((bit, index) => `${index + 1} (${bit})`)],
  }
  return <section aria-label="DP table and the integers it stands for" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <DPDependencyView title="f[i][j]: smallest maximum after i entries of nums1 and j of nums2" shape="grid" values={step.values} target={step.target} sources={step.sources} recurrence={step.recurrence} why={step.why} labels={labels} />
    <div style={box}>
      <h3 style={heading}>One filling that reaches f[{i}][{j}] = {step.values[i][j]}</h3>
      <Lane name="nums1" bits={nums1} placed={a} which={1} lastIndex={i - 1} />
      <Lane name="nums2" bits={nums2} placed={b} which={2} lastIndex={j - 1} />
    </div>
    <div style={box}>
      <h3 style={heading}>Integers used, in order. A gap is an integer of the wrong parity that nobody could take.</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Array.from({ length: top }, (_, index) => {
          const value = index + 1
          const who = owner.get(value)
          return <div key={value} data-number={value} data-owner={who?.which ?? 0} title={who?.label} style={{ width: 34, textAlign: 'center', padding: '4px 0', borderRadius: 6, border: `1px ${who ? 'solid' : 'dashed'} ${who ? `var(${COLORS[who.which]})` : 'var(--border)'}`, background: who ? tint(COLORS[who.which]) : 'transparent', color: who ? 'var(--text)' : 'var(--text-dim)', fontWeight: who ? 700 : 400 }}>{value}</div>
        })}
      </div>
    </div>
  </section>
}
