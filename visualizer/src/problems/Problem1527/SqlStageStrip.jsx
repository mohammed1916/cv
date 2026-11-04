export default function SqlStageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0 }}>
    {phases.map((phase, index) => {
      const active = phase.id === current
      return <li key={phase.id} data-stage={phase.id} aria-current={active ? 'step' : undefined} style={{
        padding: '4px 10px', border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`, borderRadius: 6,
        background: active ? 'var(--surface2)' : 'transparent', color: 'var(--text)', fontWeight: active ? 600 : 400,
      }}>{index + 1}. {phase.label}</li>
    })}
  </ol>
}
