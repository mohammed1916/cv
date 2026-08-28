import { displayValue, normalizeKind, shortValue, stateClass, toArray } from './rendererUtils'

function normalizeItems(items) {
  return toArray(items).map((item, index) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return {
        ...item,
        id: item.id ?? `item-${index}`,
        value: Object.prototype.hasOwnProperty.call(item, 'value') ? item.value : item.label,
        originalIndex: index,
      }
    }

    return { id: `item-${index}`, value: item, originalIndex: index }
  })
}

function normalizePointers(pointers) {
  if (Array.isArray(pointers)) {
    return pointers.map((pointer, index) => {
      if (pointer && typeof pointer === 'object') {
        return {
          ...pointer,
          id: pointer.id ?? `pointer-${index}`,
          label: pointer.label ?? pointer.name ?? pointer.id ?? `p${index}`,
          index: Number(pointer.index ?? pointer.at ?? pointer.target),
        }
      }

      return { id: `pointer-${index}`, label: `p${index}`, index: Number(pointer) }
    })
  }

  if (pointers && typeof pointers === 'object') {
    return Object.entries(pointers).map(([label, value]) => {
      const pointer = value && typeof value === 'object' ? value : { index: value }
      return {
        ...pointer,
        id: pointer.id ?? `pointer-${label}`,
        label: pointer.label ?? label,
        index: Number(pointer.index ?? pointer.at ?? pointer.target),
      }
    })
  }

  return []
}

function emptyLabel(type) {
  if (type === 'string') return 'Empty string'
  if (type === 'stack') return 'Empty stack'
  if (type === 'queue') return 'Empty queue'
  if (type === 'deque') return 'Empty deque'
  return 'Empty sequence'
}

export default function SequenceRenderer({ container = {} }) {
  const type = normalizeKind(container.type) || 'array'
  const sourceItems = normalizeItems(container.items)
  const isStack = type === 'stack'
  const items = isStack ? [...sourceItems].reverse() : sourceItems
  const pointers = normalizePointers(container.pointers)

  if (items.length === 0) {
    return (
      <div className={`playground-renderer-empty sequence-empty is-${type}`}>
        <span className="playground-empty-symbol" aria-hidden="true">[ ]</span>
        <span>{emptyLabel(type)}</span>
        <small>Ready for values</small>
      </div>
    )
  }

  return (
    <div className={`playground-sequence playground-sequence-${type}`}>
      <div className="playground-sequence-track" role="list" aria-label={`${type} values`}>
        {items.map((item, visualIndex) => {
          const itemPointers = pointers.filter((pointer) => pointer.index === item.originalIndex)
          const isFront = item.originalIndex === 0
          const isBack = item.originalIndex === sourceItems.length - 1

          return (
            <div className="playground-sequence-item-shell" key={String(item.id ?? visualIndex)} role="listitem">
              <div className="playground-pointer-slot">
                {itemPointers.map((pointer) => (
                  <span
                    className={`playground-pointer ${stateClass(pointer.state)}`}
                    key={String(pointer.id)}
                    title={`Points to index ${item.originalIndex}`}
                  >
                    {shortValue(pointer.label, 14)}
                  </span>
                ))}
              </div>
              <div
                className={`playground-sequence-cell ${stateClass(item.state)}`}
                data-state={item.state == null ? undefined : displayValue(item.state)}
                title={displayValue(item.value)}
              >
                <span>{shortValue(item.value, 18)}</span>
              </div>
              <div className="playground-sequence-index">
                <span>{item.originalIndex}</span>
                {isStack && visualIndex === 0 && <b>top</b>}
                {type === 'queue' && isFront && <b>front</b>}
                {type === 'queue' && isBack && <b>back</b>}
                {type === 'deque' && isFront && <b>front</b>}
                {type === 'deque' && isBack && <b>back</b>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
