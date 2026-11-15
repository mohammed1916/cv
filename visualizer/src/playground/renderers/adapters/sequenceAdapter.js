// Adapters from a sequence container (list or string from the trace) to the shared
// PointerRail, IndexedSequence and StackOperationView components. Pure functions only.
import { displayValue, normalizeKind } from '../rendererUtils.js'

const SEQUENCE_TYPES = new Set(['array', 'string'])

function itemValues(container) {
  return (Array.isArray(container?.items) ? container.items : []).map((item) => (
    item && typeof item === 'object' && !Array.isArray(item) ? item : { value: item }
  ))
}

function validPointers(container) {
  const length = itemValues(container).length
  return (Array.isArray(container?.pointers) ? container.pointers : [])
    .map((pointer, index) => ({
      id: String(pointer?.id ?? `pointer-${index}`),
      label: String(pointer?.label ?? pointer?.name ?? `p${index}`),
      index: Number(pointer?.index),
      tone: pointer?.tone,
    }))
    .filter((pointer) => Number.isInteger(pointer.index) && pointer.index >= 0 && pointer.index < length)
}

function changedIndices(items) {
  return items.flatMap((item, index) => (item.state === 'changed' ? [index] : []))
}

function activeIndex(items) {
  return items.findIndex((item) => item.state === 'active')
}

// Which shared component a sequence container should use, or null for the generic renderer.
export function sequenceSharedKind(container) {
  const type = normalizeKind(container?.type) || 'array'
  if (type === 'stack') return 'stack'
  if (!SEQUENCE_TYPES.has(type)) return null
  return validPointers(container).length > 0 ? 'pointer-rail' : 'indexed-sequence'
}

export function toPointerRailProps(container) {
  const items = itemValues(container)
  return {
    title: String(container?.name ?? container?.id ?? 'Sequence'),
    values: items.map((item) => displayValue(item.value)),
    pointers: validPointers(container),
    highlight: changedIndices(items),
  }
}

export function toIndexedSequenceProps(container) {
  const items = itemValues(container)
  return {
    label: String(container?.name ?? container?.id ?? 'Sequence'),
    length: items.length,
    valueAt: (index) => displayValue(items[index]?.value),
    active: activeIndex(items),
    roleAt: (index) => (items[index]?.state === 'changed' ? 'changed' : ''),
  }
}

// Stack view: the items bottom to top, plus values popped in the trace. The Python trace does not
// yet record pops, so `popped` comes from container.popped ([{ name, value }]) when present.
export function toStackOperationProps(container) {
  const items = itemValues(container).map((item) => displayValue(item.value))
  const popped = (Array.isArray(container?.popped) ? container.popped : [])
    .filter((entry) => entry && typeof entry === 'object' && entry.name != null && 'value' in entry)
    .map((entry) => ({ name: String(entry.name), value: displayValue(entry.value) }))
  return {
    label: String(container?.name ?? container?.id ?? 'Stack'),
    items,
    popped,
  }
}
