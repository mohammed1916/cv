// The stage strip: each stage of the walk, with the current one marked.
export default function StageStrip({ phases = [], step }) {
  const current = Math.max(0, phases.findIndex(p => p.id === step.phase))
  return (
    <ol aria-label="Stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0, color: 'var(--text)' }}>
      {phases.map((p, i) => (
        <li key={p.id} aria-current={i === current ? 'step' : undefined} style={{
          padding: '4px 10px', borderRadius: 999, border: `1px solid ${i === current ? 'var(--primary)' : 'var(--border)'}`,
          background: i === current ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)', fontWeight: i === current ? 700 : 400,
        }}>{p.label}</li>
      ))}
    </ol>
  )
}
