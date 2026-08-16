import { motion } from 'framer-motion'
import { getSituationColor, getSituationActorColor } from './useSituationAnalysis'
import './SituationOverlay.css'

export default function SituationOverlay({ situation, step, stepIndex, totalSteps }) {
  if (!situation) return null

  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0

  return (
    <motion.div
      className="situation-overlay"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        borderLeftColor: getSituationColor(situation),
        borderTopColor: getSituationColor(situation),
      }}
    >
      {/* Header with emoji and title */}
      <div className="situation-header">
        <span className="situation-emoji">{situation.emoji}</span>
        <div className="situation-title-block">
          <strong className="situation-title">{situation.title}</strong>
          <span className="situation-actor" style={{ color: getSituationActorColor(situation.actor) }}>
            {situation.actor.charAt(0).toUpperCase() + situation.actor.slice(1)}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="situation-description">{situation.description}</div>

      {/* Details */}
      {situation.details && (
        <div className="situation-details">{situation.details}</div>
      )}

      {/* Progress bar */}
      <div className="situation-progress-bar">
        <motion.div
          className="situation-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{ backgroundColor: getSituationColor(situation) }}
        />
        <span className="situation-progress-text">
          Step {stepIndex + 1} of {totalSteps}
        </span>
      </div>

      {/* Affected nodes (if any) */}
      {situation.affectedNodes && situation.affectedNodes.length > 0 && (
        <div className="situation-nodes">
          <span className="situation-nodes-label">Nodes involved:</span>
          <div className="situation-node-chips">
            {situation.affectedNodes.slice(0, 8).map((nodeId) => (
              <span
                key={nodeId}
                className="situation-node-chip"
                style={{ borderColor: getSituationColor(situation) }}
              >
                {nodeId}
              </span>
            ))}
            {situation.affectedNodes.length > 8 && (
              <span className="situation-node-more">
                +{situation.affectedNodes.length - 8}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
