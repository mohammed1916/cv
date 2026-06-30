import { useMemo } from 'react'
import './CodePatternAnnotations.css'

const PatternInfo = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'calc_diff': { icon: '−', label: 'Calculate', color: '#f59e0b' },
  'check_map': { icon: '🔍', label: 'Search', color: '#8b5cf6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'add_map': { icon: '➕', label: 'Store', color: '#ec4899' },
}

// Standard line height in Monaco Editor
const LINE_HEIGHT = 20

export default function CodePatternAnnotations({ linePatterns, currentPhase, activeLineDom }) {
  const annotations = useMemo(() => {
    if (!linePatterns) return []
    return Object.entries(linePatterns).map(([line, phase]) => ({
      line: parseInt(line),
      phase,
      ...PatternInfo[phase],
    }))
  }, [linePatterns])

  // Get the position offset from activeLineDom
  const getTopPosition = (targetLine) => {
    if (!activeLineDom) return null

    const activeLineNum = parseInt(activeLineDom.getAttribute('data-line') || activeLineDom.textContent.match(/^\d+/)?.[0] || '0')
    if (!activeLineNum) return null

    const activeRect = activeLineDom.getBoundingClientRect()
    const codePanel = activeLineDom.closest('[class*="code"]') || activeLineDom.closest('[class*="Code"]')
    if (!codePanel) return null

    const containerRect = codePanel.getBoundingClientRect()
    const lineOffset = (targetLine - activeLineNum) * LINE_HEIGHT
    const currentLineTop = activeRect.top - containerRect.top

    return currentLineTop + lineOffset
  }

  return (
    <div className="code-pattern-annotations">
      {annotations.map(({ line, phase, icon, label, color }) => {
        const isActive = currentPhase === phase
        const top = getTopPosition(line)

        return (
          <div
            key={`${line}-${phase}`}
            className={`code-annotation ${isActive ? 'active' : ''}`}
            style={{
              '--pattern-color': color,
              top: top !== null ? `${top}px` : undefined,
            }}
          >
            <div className="annotation-badge">
              <span className="annotation-icon">{icon}</span>
              <span className="annotation-label">{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
