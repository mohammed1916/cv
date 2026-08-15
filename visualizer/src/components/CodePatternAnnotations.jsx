import { useMemo } from 'react'
import './CodePatternAnnotations.css'
import { resolvePattern } from './patternCatalog'

// Standard Monaco Editor line height
const LINE_HEIGHT = 20

export default function CodePatternAnnotations({ linePatterns, currentPhase, activeLineDom, activeLine }) {
  const annotations = useMemo(() => {
    if (!linePatterns) return []
    return Object.entries(linePatterns).map(([line, phase]) => ({
      line: parseInt(line),
      phase,
      ...resolvePattern(phase),
    }))
  }, [linePatterns])

  const getTopPosition = (targetLine) => {
    if (!activeLineDom || !activeLine) return undefined

    const activeRect = activeLineDom.getBoundingClientRect()
    const codePanel = activeLineDom.closest('.ctp-panel') || activeLineDom.closest('[class*="code"]')

    if (!codePanel) return undefined

    const panelRect = codePanel.getBoundingClientRect()
    const panelScrollTop = codePanel.scrollTop || 0

    // Position relative to code panel, accounting for scroll and line offset
    const baselineTop = activeRect.top - panelRect.top + panelScrollTop
    const lineOffset = (targetLine - activeLine) * LINE_HEIGHT

    return baselineTop + lineOffset
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
              top: top !== undefined ? `${top}px` : undefined,
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
