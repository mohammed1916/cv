import { useState } from 'react'
import './VisualizationControls.css'

export default function VisualizationControls({
  features = [],
  onToggle,
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!features.length) return null

  // Group features by category
  const dpFeatures = features.filter(f => f.category === 'dp')
  const flowFeatures = features.filter(f => f.category === 'flow')
  const detailFeatures = features.filter(f => f.category === 'detail')

  const renderFeatureGroup = (title, items) => {
    if (!items.length) return null
    return (
      <div key={title} className="viz-group">
        <div className="viz-group-title">{title}</div>
        <div className="viz-group-items">
          {items.map((feature) => (
            <label key={feature.id} className="viz-feature" title={feature.description}>
              <input
                type="checkbox"
                checked={feature.enabled}
                onChange={(e) => onToggle(feature.id, e.target.checked)}
              />
              <span className="viz-feature-label">{feature.icon} {feature.label}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="viz-controls">
      <button
        type="button"
        className={`viz-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="viz-toggle-icon">📊</span>
        <span className="viz-toggle-text">Visualizations</span>
        <span className="viz-toggle-arrow">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="viz-panel">
          {renderFeatureGroup('DP Analysis', dpFeatures)}
          {renderFeatureGroup('Flow & Movement', flowFeatures)}
          {renderFeatureGroup('Details & Breakdowns', detailFeatures)}
        </div>
      )}
    </div>
  )
}
