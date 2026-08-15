import './PatternLegend.css'
import { resolvePattern } from './patternCatalog'

export default function PatternLegend({ currentPhase, usedPatterns }) {
  // Filter to show only patterns used in this algorithm
  const patternsToShow = Array.isArray(usedPatterns) && usedPatterns.length
    ? usedPatterns
    : ['init', 'loop', 'check', 'update', 'done']

  return (
    <div className="pattern-legend">
      <div className="pattern-legend-title">Pattern Guide</div>
      <div className="pattern-legend-grid">
        {patternsToShow.map((phaseKey) => {
          const pattern = resolvePattern(phaseKey)

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
