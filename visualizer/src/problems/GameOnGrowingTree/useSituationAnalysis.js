import { useMemo } from 'react'

/**
 * Analyzes a step to determine what situation/action is occurring
 * Returns: { type, description, emoji, affectedNodes, blockedNodes, availableMoves, actor }
 */
function analyzeSituation(step, prevStep) {
  if (!step) return null

  const {
    phase,
    message,
    currentParentIndex,
    intervalLeft,
    intervalRight,
    midpoint,
    computedValue,
    activeLine,
  } = step

  // Game initialization
  if (phase === 'init' || !prevStep) {
    return {
      type: 'init',
      description: 'Game initialized',
      emoji: '🎮',
      title: 'Game Started',
      details: 'Alice starts at node 1 (root)',
      affectedNodes: [1],
      actor: 'system',
    }
  }

  // Parent parsing phase
  if (phase === 'parse-parent') {
    return {
      type: 'parse',
      description: `Parsing parent index ${currentParentIndex}`,
      emoji: '📍',
      title: 'Building Tree',
      details: `Processing parent information for node ${currentParentIndex}`,
      affectedNodes: [currentParentIndex],
      actor: 'alice',
    }
  }

  // Divide and conquer - solving interval
  if (phase === 'solve-prefix' || phase === 'solve-suffix' || phase === 'solve-interval') {
    const isPrefix = phase === 'solve-prefix'
    const isSuffix = phase === 'solve-suffix'
    const rangeType = isPrefix ? 'prefix' : isSuffix ? 'suffix' : 'interval'

    return {
      type: 'solve',
      description: `Solving ${rangeType} [${intervalLeft}, ${intervalRight}]`,
      emoji: '🔍',
      title: 'Alice Explores',
      details: `Interval: [${intervalLeft}, ${intervalRight}] | Midpoint: ${midpoint}`,
      affectedNodes: Array.from(
        { length: intervalRight - intervalLeft + 1 },
        (_, i) => intervalLeft + i
      ),
      actor: 'alice',
    }
  }

  // Merging/combining results
  if (phase === 'merge' || phase === 'combine') {
    return {
      type: 'merge',
      description: `Combining results for interval [${intervalLeft}, ${intervalRight}]`,
      emoji: '🔗',
      title: 'Merging Results',
      details: `Computed value: ${computedValue}`,
      affectedNodes: Array.from(
        { length: intervalRight - intervalLeft + 1 },
        (_, i) => intervalLeft + i
      ),
      actor: 'alice',
    }
  }

  // DP computation phases
  if (phase === 'up' || phase === 'bottom-up') {
    return {
      type: 'dp-up',
      description: 'Bottom-up DP propagation',
      emoji: '⬆️',
      title: 'Computing Depths',
      details: message || 'Propagating depth information upward',
      actor: 'alice',
    }
  }

  if (phase === 'down' || phase === 'top-down') {
    return {
      type: 'dp-down',
      description: 'Top-down DP propagation',
      emoji: '⬇️',
      title: 'Finalizing Scores',
      details: message || 'Propagating depth information downward',
      actor: 'alice',
    }
  }

  // Game ending
  if (phase === 'done' || phase === 'finished') {
    return {
      type: 'done',
      description: 'Game ended',
      emoji: '🏁',
      title: 'Game Complete',
      details: message || 'All nodes processed',
      actor: 'system',
    }
  }

  // Default
  return {
    type: 'step',
    description: message || `Step: ${phase}`,
    emoji: '•',
    title: 'Processing',
    details: `Phase: ${phase}`,
    actor: 'alice',
  }
}

export function useSituationAnalysis(step, prevStep) {
  return useMemo(() => {
    return analyzeSituation(step, prevStep)
  }, [step, prevStep])
}

export function getSituationColor(situation) {
  if (!situation) return '#94a3b8'

  const colorMap = {
    init: '#3b82f6', // blue
    parse: '#8b5cf6', // purple
    solve: '#06b6d4', // cyan
    merge: '#14b8a6', // teal
    'dp-up': '#f59e0b', // amber
    'dp-down': '#ef4444', // red
    done: '#10b981', // emerald
    step: '#6b7280', // gray
  }

  return colorMap[situation.type] || '#94a3b8'
}

export function getSituationActorColor(actor) {
  const colorMap = {
    alice: '#3b82f6', // blue
    bob: '#ef4444', // red
    system: '#6b7280', // gray
  }
  return colorMap[actor] || '#94a3b8'
}
