import { useState } from 'react'
import ToggleSwitch from './ToggleSwitch'
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
            <ToggleSwitch
              key={feature.id}
              id={`toggle-${feature.id}`}
              icon={feature.icon}
              label={feature.label}
              description={feature.description}
              checked={feature.enabled}
              onChange={(checked) => onToggle(feature.id, checked)}
            />
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
