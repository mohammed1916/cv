const CELL = 46
const GAP = 6

function cellStyle(value, target, settled, inPair) {
  const matches = value === target
  const tone = matches ? 'var(--success)' : 'var(--error)'
  return {
    width: CELL, height: CELL, boxSizing: 'border-box', borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 17,
    color: 'var(--text)', border: `${inPair ? 3 : 1}px solid ${inPair ? 'var(--primary)' : tone}`,
    background: `color-mix(in srgb, ${tone} ${settled ? 34 : 14}%, var(--surface2))`,
  }
}

function Label({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{children}</div>
}

// Green entries match the target and red ones do not; the frame sweeps left to right behind a settled edge.
export default function FlipView({ run, step }) {
  const { nums, k } = run.input
  const n = nums.length
  const width = n * (CELL + GAP) - GAP
  const center = i => i * (CELL + GAP) + CELL / 2
  const scanned = step.phase === 'check' || step.phase === 'done' ? n : step.phase === 'target' ? 0 : step.at
  const over = step.flips > k
  const slots = Math.max(k, step.flips)
  return <section aria-label="Pair flips toward a target" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      <span style={{ fontSize: 15 }}>Target <strong style={{ fontSize: 20 }}>{step.target}</strong></span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Moves</span>
      <div style={{ display: 'flex', gap: 3 }} role="img" aria-label={`${step.flips} moves used of ${k} allowed`}>
        {Array.from({ length: slots }, (_, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${i < k ? 'var(--border)' : 'var(--error)'}`, background: i < step.flips ? (i < k ? 'var(--primary)' : 'var(--error)') : 'var(--surface2)' }} />)}
      </div>
      <strong style={{ color: over ? 'var(--error)' : 'var(--text)' }}>{step.flips} / {k}</strong>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <Label>Original array</Label>
      <div style={{ display: 'flex', gap: GAP, width, marginBottom: 12 }}>
        {nums.map((v, i) => <div key={i} style={{ width: CELL, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>{v}</div>)}
      </div>
      <Label>Working copy</Label>
      <div style={{ position: 'relative', width }}>
        <svg width={width} height={26} viewBox={`0 0 ${width} 26`} aria-hidden="true" style={{ display: 'block' }}>
          {step.pair && <path d={`M ${center(step.pair[0])} 24 V 8 H ${center(step.pair[1])} V 24`} fill="none" stroke="var(--primary)" strokeWidth="2" />}
        </svg>
        <div style={{ display: 'flex', gap: GAP }}>
          {step.arr.map((v, i) => <div key={i} data-index={i} data-chat-selectable data-chat-label={`Working copy [${i}]`} style={cellStyle(v, step.target, i < scanned, !!step.pair && step.pair.includes(i))}>{v}</div>)}
        </div>
        <div style={{ display: 'flex', gap: GAP, marginTop: 4 }}>
          {step.arr.map((_, i) => <div key={i} style={{ width: CELL, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>{i === step.at ? `▲ ${i}` : i < scanned ? 'settled' : i}</div>)}
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }} aria-label="Targets tried">
      {[1, -1].map(target => {
        const attempt = step.attempts.find(a => a.target === target)
        const tone = !attempt ? 'var(--border)' : attempt.ok ? 'var(--success)' : 'var(--error)'
        const text = !attempt ? (target === step.target ? 'in progress' : 'not tried') : attempt.ok ? `works, ${attempt.flips} moves` : attempt.lastOk ? `too many: ${attempt.flips} moves` : 'last entry stays wrong'
        return <div key={target} style={{ padding: '6px 12px', borderRadius: 8, border: `2px solid ${tone}`, background: 'var(--surface2)', fontSize: 13 }}><strong>All {target}</strong>: {text}</div>
      })}
      {step.phase === 'done' && <output style={{ padding: '6px 12px', borderRadius: 8, border: '2px solid var(--primary)', fontWeight: 700 }}>Answer: {String(step.result)}</output>}
    </div>
  </section>
}
