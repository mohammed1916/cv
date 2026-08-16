import { motion } from 'framer-motion'
import './DualRepresentationView.css'

/**
 * Dual-Representation View: Computation + Story layers aligned
 *
 * Mode 1 (left): Visual Computation - formal state machine
 * Mode 2 (right): Visual Story - narrative interpretation
 *
 * Both synchronized to current step, showing causality and mechanism
 */
export default function DualRepresentationView({
  step,
  steps,
  stepIndex,
  dpSnapshot,
  totalNodes,
  pruningAnalysis,
  situationAnalysis,
}) {
  if (!step || !steps) return null

  return (
    <div className="dual-rep-shell">
      {/* Computation View (Structure) */}
      <div className="dual-rep-panel computation-view">
        <div className="dual-rep-header">
          <h3>Visual Computation</h3>
          <span className="view-label">State Machine</span>
        </div>

        <div className="dual-rep-content">
          {/* State */}
          <div className="rep-section">
            <div className="section-title">STATE</div>
            <div className="state-box">
              <div className="state-line">
                <span className="label">phase:</span>
                <span className="value">{situationAnalysis?.phase || 'unknown'}</span>
              </div>
              <div className="state-line">
                <span className="label">active_node:</span>
                <span className="value">{step.focus?.targetNode ?? step.focus?.sourceNode ?? '-'}</span>
              </div>
              <div className="state-line">
                <span className="label">line:</span>
                <span className="value">{step.activeLine}</span>
              </div>
              <div className="state-line">
                <span className="label">nodes_computed:</span>
                <span className="value">{countComputedNodes(dpSnapshot)}/{totalNodes}</span>
              </div>
              <div className="state-line">
                <span className="label">pruned_edges:</span>
                <span className="value">{pruningAnalysis?.prunedEdges?.size ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="rep-section">
            <div className="section-title">ACTION</div>
            <div className="action-box">
              <div className="action-line">
                <span className="trigger">
                  {getActionTrigger(step)}
                </span>
              </div>
              <div className="action-response">
                {step.message}
              </div>
            </div>
          </div>

          {/* Delta */}
          <div className="rep-section">
            <div className="section-title">DELTA</div>
            <div className="delta-box">
              {getDeltaChanges(step, steps, stepIndex).map((change, idx) => (
                <div key={idx} className="delta-line">
                  <span className="before">{change.before}</span>
                  <span className="arrow">→</span>
                  <span className="after">{change.after}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Story View (Narrative) */}
      <div className="dual-rep-panel story-view">
        <div className="dual-rep-header">
          <h3>Visual Story</h3>
          <span className="view-label">Human Model</span>
        </div>

        <div className="dual-rep-content">
          {/* Scene */}
          <div className="rep-section">
            <div className="section-title">SCENE</div>
            <div className="story-box scene">
              <p>{getSceneDescription(step, dpSnapshot, totalNodes)}</p>
            </div>
          </div>

          {/* Intention */}
          <div className="rep-section">
            <div className="section-title">INTENTION</div>
            <div className="story-box intention">
              <p>{getIntentionDescription(step, pruningAnalysis)}</p>
            </div>
          </div>

          {/* Outcome */}
          <div className="rep-section">
            <div className="section-title">OUTCOME</div>
            <div className="story-box outcome">
              <p>{getOutcomeDescription(step)}</p>
            </div>
          </div>

          {/* Debug Lens (optional) */}
          {step.focus?.pruned && (
            <div className="rep-section debug-lens">
              <div className="section-title debug">DEBUG</div>
              <div className="debug-box">
                <div className="debug-line">
                  <span className="label">pruning_rule:</span>
                  <span className="value">depth &lt; any top-3</span>
                </div>
                <div className="debug-line">
                  <span className="label">decision:</span>
                  <span className="value highlight-reject">REJECTED</span>
                </div>
                <div className="debug-line">
                  <span className="label">reason:</span>
                  <span className="reason-text">Contribution doesn't improve top-3 rankings</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions

function countComputedNodes(dpSnapshot) {
  if (!dpSnapshot) return 0
  const first = dpSnapshot.first?.filter(v => v > 0).length || 0
  return first
}

function getActionTrigger(step) {
  if (step.activeLine >= 9 && step.activeLine <= 14) {
    return 'Bottom-up: Child → Parent contribution'
  }
  if (step.activeLine >= 15 && step.activeLine <= 23) {
    return 'Top-down: Parent → Child depth'
  }
  if (step.activeLine === 6) {
    return 'Initialize: Create top-3 arrays'
  }
  return 'Compute next step'
}

function getDeltaChanges(step, steps, stepIndex) {
  const changes = []

  // Show what array changed
  if (step.activeLine === 12) {
    changes.push({
      before: 'first[parent] = ?',
      after: `first[parent] = ${step.message.match(/depth \d+/)?.[0] || '...'}`,
    })
  } else if (step.activeLine === 13) {
    changes.push({
      before: 'second[parent] = ?',
      after: `second[parent] = ${step.message.match(/depth \d+/)?.[0] || '...'}`,
    })
  } else if (step.activeLine === 14) {
    if (step.focus?.pruned) {
      changes.push({
        before: `depth != (top-3)`,
        after: `PRUNED: path blocked`,
      })
    } else {
      changes.push({
        before: 'third[node] = ?',
        after: `third[node] = ${step.message.match(/depth \d+/)?.[0] || '...'}`,
      })
    }
  }

  return changes.length > 0 ? changes : [{ before: '(state)', after: '(updated)' }]
}

function getSceneDescription(step, dpSnapshot, totalNodes) {
  const computed = countComputedNodes(dpSnapshot)
  const progress = Math.round((computed / totalNodes) * 100)

  if (step.activeLine >= 9 && step.activeLine <= 14) {
    return `Working up the tree from leaves to root. Child nodes contribute their best depths to parents. Currently ${progress}% complete.`
  }
  if (step.activeLine >= 15 && step.activeLine <= 23) {
    return `Pushing optimal depths down from root to leaves. Each node receives the best path length from its parent. At ${progress}% progress.`
  }
  if (step.activeLine === 6) {
    return `Starting fresh. Preparing three arrays to track the best depths found at each node. The algorithm will now fill these arrays.`
  }
  return `Processing the tree structure. Building up the solution step by step.`
}

function getIntentionDescription(step, pruningAnalysis) {
  if (step.focus?.pruned) {
    return `This path's contribution is worse than the three best options already found. It's not worth keeping.`
  }
  if (step.activeLine === 12) {
    return `This contribution is the best seen so far—it moves to first rank and pushes the previous values down.`
  }
  if (step.activeLine === 13) {
    return `Good contribution, but not the best. It takes second place while others shift down.`
  }
  if (step.activeLine === 14) {
    return `Acceptable contribution. It takes third place as a backup option.`
  }
  return `Moving forward in the algorithm, maintaining the top-3 best options at each node.`
}

function getOutcomeDescription(step) {
  if (step.focus?.pruned) {
    return `The pruned path is marked and will be grayed out. Its potential contribution is eliminated from future consideration.`
  }
  if (step.activeLine === 12) {
    return `Rankings updated: new champion found, previous best moves to second, second becomes third.`
  }
  if (step.activeLine === 13) {
    return `Rankings updated: second-place adjusted, third place shifts accordingly.`
  }
  if (step.activeLine === 14) {
    return `Rankings updated: third-place entry recorded. Top-3 now complete at this node.`
  }
  return `Progress made toward the final answer. State advanced to next computation.`
}
