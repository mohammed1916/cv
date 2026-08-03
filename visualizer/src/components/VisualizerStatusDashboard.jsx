import { useMemo } from 'react'
import { getRegistryStats, getUnsolvedProblems } from '../config/problemVisualizerRegistry'

export default function VisualizerStatusDashboard() {
  const stats = useMemo(() => getRegistryStats(), [])
  const unsolved = useMemo(() => getUnsolvedProblems(), [])

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <section style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: 28, fontWeight: 700 }}>Visualizer Status</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Overview of which problems have story-based visualizers</p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{ padding: 16, backgroundColor: '#dcfce7', borderRadius: 8, border: '1px solid #86efac' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>{stats.totalSolved}</div>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>✓ SOLVED (with visualizers)</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#fee2e2', borderRadius: 8, border: '1px solid #fecaca' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>{stats.totalUnsolved}</div>
          <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>✗ NOT SOLVED (need visualizers)</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#dbeafe', borderRadius: 8, border: '1px solid #0ea5e9' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>{stats.percentSolved}%</div>
          <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Complete</div>
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Unsolved Problems ({unsolved.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {unsolved.map((problem) => (
            <div
              key={problem.slug}
              style={{
                padding: 12,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                #{problem.number} {problem.title}
              </div>
              <div style={{ color: '#64748b', marginBottom: 8, fontSize: 11 }}>
                <span style={{ display: 'inline-block', marginRight: 8 }}>{problem.difficulty}</span>
                <span style={{ display: 'inline-block' }}>{problem.slug}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: 3,
                      fontSize: 10,
                      color: '#475569',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
