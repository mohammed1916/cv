import { useState, useMemo, useCallback } from 'react'

/**
 * Manages visualization feature state and definitions
 * @param {Object} featureDefinitions - Map of feature IDs to their config
 * @example
 * const { items, toggle } = useVisualizationFeatures({
 *   dpDetails: { icon: '🔢', label: 'DP Details', category: 'dp' },
 *   edgeFlow: { icon: '🔗', label: 'Edge Flow', category: 'flow' },
 * })
 */
export function useVisualizationFeatures(featureDefinitions = {}) {
  // Initialize enabled state for each feature
  const [enabledFeatures, setEnabledFeatures] = useState(
    Object.keys(featureDefinitions).reduce((acc, id) => {
      acc[id] = featureDefinitions[id].enabledByDefault ?? false
      return acc
    }, {})
  )

  // Build feature items with state
  const items = useMemo(() => {
    return Object.entries(featureDefinitions).map(([id, config]) => ({
      id,
      ...config,
      enabled: enabledFeatures[id],
    }))
  }, [featureDefinitions, enabledFeatures])

  // Toggle handler
  const toggle = useCallback((featureId, enabled) => {
    setEnabledFeatures((prev) => ({
      ...prev,
      [featureId]: enabled,
    }))
  }, [])

  // Get enabled feature IDs
  const enabledIds = useMemo(
    () => Object.keys(enabledFeatures).filter((id) => enabledFeatures[id]),
    [enabledFeatures]
  )

  return { items, toggle, enabledFeatures, enabledIds }
}
