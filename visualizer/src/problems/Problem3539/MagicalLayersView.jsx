const tint = token => `color-mix(in srgb, var(${token}) 24%, var(--surface))`
const box = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, overflowX: 'auto', color: 'var(--text)' }
const heading = { margin: '0 0 8px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }
const th = { padding: '4px 8px', textAlign: 'right', background: 'var(--surface3)', color: 'var(--text)', whiteSpace: 'nowrap' }
const td = { padding: '4px 8px', textAlign: 'right', borderTop: '1px solid var(--border)', color: 'var(--text)', whiteSpace: 'nowrap' }

const same = (a, b) => a && b && a.used === b.used && a.carry === b.carry && a.bits === b.bits

function StateChip({ state, active, accepted, rejected }) {
  const border = active ? 'var(--primary)' : accepted ? 'var(--success)' : rejected ? 'var(--error)' : 'var(--border)'
  const fill = active ? tint('--primary') : accepted ? tint('--success') : rejected ? tint('--error') : 'var(--surface)'
  return <div data-state={`${state.used},${state.carry},${state.bits}`} data-active={active || undefined} style={{ border: `${active ? 2 : 1}px solid ${border}`, background: fill, borderRadius: 6, padding: '3px 8px', fontSize: 12, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textDecoration: rejected ? 'line-through' : 'none' }}>
    <span>used {state.used} · carry {state.carry} · bits {state.bits}</span>
    <strong style={{ display: 'block' }}>weight {state.ways}</strong>
  </div>
}

// Shows the bit a transition's total leaves behind and the part it pushes up to the next position.
function CarrySplit({ row, index }) {
  const binary = row.total.toString(2)
  const low = binary.at(-1)
  const high = binary.slice(0, -1) || '0'
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>
    {row.total} = <span style={{ color: 'var(--text-muted)' }}>{high}</span><strong style={{ color: low === '1' ? 'var(--success)' : 'var(--text)' }}>{low}</strong><sub>2</sub>
    <small style={{ color: 'var(--text-muted)' }}> bit at 2^{index}: {low}</small>
  </span>
}

// Bit positions along the top, the layered states in the middle and the expansion of the active state below.
export default function MagicalLayersView({ run, step }) {
  const { nums, m, k } = run.input
  const checkFor = state => step.checks?.find(c => same(c, state))
  return <section aria-label="Layered carry states" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={box}>
      <h3 style={heading}>Each index is one binary position. Target: m = {m} copies in all, k = {k} set bits.</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((value, index) => {
          const active = index === step.index
          const done = index < step.index
          return <div key={index} data-index={index} data-active={active || undefined} style={{ minWidth: 64, textAlign: 'center', borderRadius: 6, padding: '4px 6px', border: `${active ? 2 : 1}px solid ${active ? 'var(--primary)' : 'var(--border)'}`, background: active ? tint('--primary') : done ? 'var(--surface3)' : 'transparent' }}>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>2^{index}</small>
            <strong>{value}</strong>
          </div>
        })}
      </div>
    </div>

    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div style={{ ...box, flex: '1 1 260px' }}>
        <h3 style={heading}>{step.phase === 'finish' || step.phase === 'done' ? 'Final states' : 'Current states'} ({step.current.length})</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {step.current.map(state => {
            const check = checkFor(state)
            return <StateChip key={`${state.used},${state.carry},${state.bits}`} state={state} active={same(state, step.active)} accepted={check?.accepted} rejected={check && !check.accepted} />
          })}
        </div>
      </div>
      {step.phase === 'state' && <div style={{ ...box, flex: '1 1 260px' }}>
        <h3 style={heading}>States reached after index {step.index} ({step.following.length})</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {step.following.map(state => <StateChip key={`${state.used},${state.carry},${state.bits}`} state={state} />)}
        </div>
      </div>}
    </div>

    {step.active && <div style={box}>
      <h3 style={heading}>Expanding used {step.active.used}, carry {step.active.carry}, bits {step.active.bits}, weight {step.active.ways}. {step.active.left} position{step.active.left === 1 ? '' : 's'} left to assign index {step.index}.</h3>
      <table style={{ borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
        <thead><tr>
          <th scope="col" style={th}>copies t</th>
          <th scope="col" style={th}>C({step.active.left}, t)</th>
          <th scope="col" style={th}>t + carry</th>
          <th scope="col" style={th}>next carry</th>
          <th scope="col" style={th}>bits so far</th>
          <th scope="col" style={th}>adds to next state</th>
        </tr></thead>
        <tbody>{step.transitions.map(row => <tr key={row.t} data-t={row.t} data-pruned={row.pruned || undefined} style={{ opacity: row.pruned ? 0.55 : 1 }}>
          <td style={td}>{row.t}</td>
          <td style={td}>{row.choose}</td>
          <td style={td}><CarrySplit row={row} index={step.index} /></td>
          <td style={td}>{row.nextCarry}</td>
          <td style={{ ...td, color: row.pruned ? 'var(--error)' : 'var(--text)' }}>{row.newBits}{row.pruned ? ` > ${k}` : ''}</td>
          <td style={td}>{row.pruned ? 'dropped' : row.gain}</td>
        </tr>)}</tbody>
      </table>
    </div>}

    {step.checks && <div style={box}>
      <h3 style={heading}>Final check: all {m} positions used, and bits plus set bits in the leftover carry equal {k}.</h3>
      <table style={{ borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
        <thead><tr><th scope="col" style={th}>used</th><th scope="col" style={th}>carry</th><th scope="col" style={th}>bits</th><th scope="col" style={th}>carry set bits</th><th scope="col" style={th}>weight</th><th scope="col" style={th}>decision</th></tr></thead>
        <tbody>{step.checks.map((c, index) => <tr key={index} data-accepted={c.accepted}>
          <td style={td}>{c.used}</td><td style={td}>{c.carry}</td><td style={td}>{c.bits}</td><td style={td}>{c.carryBits}</td><td style={td}>{c.ways}</td>
          <td style={{ ...td, color: c.accepted ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>{c.accepted ? 'keep' : 'reject'}</td>
        </tr>)}</tbody>
      </table>
      <p style={{ margin: '8px 0 0', fontWeight: 700 }}>Sum of kept weights: {step.answer}</p>
    </div>}
  </section>
}
