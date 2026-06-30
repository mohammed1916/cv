import './PatternLegend.css'

const PatternDefinitions = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'calc_diff': { icon: '−', label: 'Calculate', color: '#f59e0b' },
  'check_map': { icon: '🔍', label: 'Search', color: '#8b5cf6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'add_map': { icon: '➕', label: 'Store', color: '#ec4899' },
  'dp-take': { icon: '✓', label: 'Take', color: '#10b981' },
  'dp-skip': { icon: '✗', label: 'Skip', color: '#ef4444' },
  'tree-visit': { icon: '●', label: 'Visit', color: '#8b5cf6' },
  'tree-left': { icon: '←', label: 'Go Left', color: '#3b82f6' },
  'tree-right': { icon: '→', label: 'Go Right', color: '#3b82f6' },
  'tree-backtrack': { icon: '⤴', label: 'Backtrack', color: '#6b7280' },
  'stack-push': { icon: '↑', label: 'Push', color: '#22c55e' },
  'stack-pop': { icon: '↓', label: 'Pop', color: '#ef4444' },
  'range-search': { icon: '🔍', label: 'Search', color: '#3b82f6' },
}

export default function PatternLegend({ currentPhase, usedPatterns }) {
  // Filter to show only patterns used in this algorithm
  const patternsToShow = usedPatterns || Object.keys(PatternDefinitions)

  return (
    <div className="pattern-legend">
      <div className="pattern-legend-title">Pattern Guide</div>
      <div className="pattern-legend-grid">
        {patternsToShow.map((phaseKey) => {
          const pattern = PatternDefinitions[phaseKey]
          if (!pattern) return null

          const isActive = currentPhase === phaseKey

          return (
            <div
              key={phaseKey}
              className={`pattern-legend-item ${isActive ? 'active' : ''}`}
              style={{ borderLeftColor: pattern.color }}
            >
              <span className="pattern-legend-icon" style={{ color: pattern.color }}>
                {pattern.icon}
              </span>
              <span className="pattern-legend-label">{pattern.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
