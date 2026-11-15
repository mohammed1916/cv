// Adapter from a map/dictionary container with numeric values (counts) to FrequencyCountTable.
// Pure functions. Returns null when the container is not a counts-style map.
import { displayValue, normalizeKind } from '../rendererUtils.js'

export function isCountsContainer(container) {
  const type = normalizeKind(container?.type)
  if (!['map', 'dictionary', 'counter', 'object', 'hash-map', 'maps', 'dictionaries'].includes(type)) return false
  const entries = Array.isArray(container?.entries) ? container.entries : []
  return entries.length > 0 && entries.every((entry) => (
    entry && typeof entry.value === 'number' && Number.isFinite(entry.value)
  ))
}

export function toFrequencyCountProps(container) {
  if (!isCountsContainer(container)) return null
  const entries = container.entries.map((entry) => [displayValue(entry.key), entry.value])
  const changed = container.entries.find((entry) => entry.state === 'changed')
  return {
    title: String(container.name ?? container.id ?? 'Counts'),
    entries,
    active: changed ? displayValue(changed.key) : null,
  }
}
