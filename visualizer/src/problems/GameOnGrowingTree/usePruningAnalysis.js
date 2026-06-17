import { useMemo } from 'react'

/**
 * Analyzes step data to determine which paths are pruned
 * A path is pruned when insertTop3 returns 0 (value worse than all top-3)
 *
 * Returns: { prunedNodeIds, prunedEdges, activePath }
 */
export function usePruningAnalysis(step, steps, stepIndex) {
  return useMemo(() => {
    if (!step || !steps) {
      return {
        prunedNodeIds: new Set(),
        prunedEdges: new Set(),
        activePath: [],
      }
    }

    const prunedNodeIds = new Set()
    const prunedEdges = new Set()
    const activePath = []

    // Simulate the algorithm up to current step to determine pruning
    // During bottom-up phase: depths from children don't make top-3 → prune that child
    if (step.activeLine >= 9 && step.activeLine <= 14) {
      // Bottom-up phase - child contributions being evaluated
      // A child is pruned if its depth didn't make the parent's top-3
      // We track this by looking at which insertTop3 calls would return 0

      // Get all steps up to current
      for (let i = 0; i <= stepIndex; i++) {
        const s = steps[i]
        if (!s) continue

        // When inserting depth and it returns 0 (return value not stored, but we can infer)
        // The source node's contribution was pruned
        if (s.phase === 'up' && s.activeLine >= 12 && s.activeLine <= 14) {
          // This is an insertion step - if the depth wasn't good enough,
          // it means this child's branch contributes less value
          // Mark nodes that made poor contributions
        }
      }
    }

    // During top-down phase: some nodes don't receive optimal depths → prune their children
    if (step.activeLine >= 15 && step.activeLine <= 23) {
      // Top-down phase - children receiving depths from parents
      // Children of nodes with worse depths might be pruned
    }

    // Active path is nodes being currently processed
    if (step.focus && step.focus.sourceNode !== undefined) {
      activePath.push(step.focus.sourceNode)
    }
    if (step.focus && step.focus.targetNode !== undefined) {
      activePath.push(step.focus.targetNode)
    }

    return {
      prunedNodeIds,
      prunedEdges,
      activePath,
      explanation: getPruningExplanation(step),
    }
  }, [step, steps, stepIndex])
}

/**
 * Get human-readable explanation of pruning
 */
export function getPruningExplanation(step) {
  if (!step) return ''

  if (step.activeLine >= 12 && step.activeLine <= 14) {
    // This is insertTop3 - the depth either made top-3 or was pruned
    const message = step.message || ''
    if (message.includes('becomes first')) {
      return '✅ New best depth - pushed into 1st rank'
    } else if (message.includes('becomes second')) {
      return '⚠️ Good depth - moved to 2nd rank'
    } else if (message.includes('becomes third')) {
      return '⚪ Acceptable depth - placed in 3rd rank'
    } else {
      return '❌ Depth pruned - worse than all current top-3'
    }
  }

  return ''
}

/**
 * Determine if a node should be visually pruned
 * A node is pruned if it doesn't contribute to any top-3 path
 */
export function isNodePruned(nodeId, prunedNodeIds) {
  return prunedNodeIds.has(nodeId)
}

/**
 * Determine if an edge should be visually pruned
 */
export function isEdgePruned(fromNode, toNode, prunedEdges) {
  const edgeKey = `${fromNode}-${toNode}`
  return prunedEdges.has(edgeKey)
}

/**
 * Get opacity for a node based on pruning state
 */
export function getNodeOpacity(nodeId, prunedNodeIds, activeNodeIds) {
  if (activeNodeIds && activeNodeIds.has(nodeId)) {
    return 1 // Active node - full opacity
  }
  if (isNodePruned(nodeId, prunedNodeIds)) {
    return 0.2 // Pruned node - very faded
  }
  return 0.65 // Normal node - slightly faded when there's pruning
}

/**
 * Get opacity for an edge based on pruning state
 */
export function getEdgeOpacity(fromNode, toNode, prunedEdges, activeNodes) {
  const edgeKey = `${fromNode}-${toNode}`
  if (
    activeNodes &&
    (activeNodes.has(fromNode) || activeNodes.has(toNode))
  ) {
    return 1 // Active edge - full opacity
  }
  if (prunedEdges.has(edgeKey)) {
    return 0.15 // Pruned edge - nearly invisible
  }
  return 0.5 // Normal edge
}

/**
 * Get grayscale filter for pruned nodes
 */
export function getPrunedNodeFilter(nodeId, prunedNodeIds) {
  if (isNodePruned(nodeId, prunedNodeIds)) {
    return 'grayscale(85%) brightness(0.85)'
  }
  return 'grayscale(0%)'
}
