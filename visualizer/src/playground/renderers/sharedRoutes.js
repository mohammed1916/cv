// Routes playground containers to the shared problem-page components through the adapters in ./adapters.
// Returns null for any container without a mapping, so the caller keeps the generic renderer.
import { createElement } from 'react'
import PointerRail from '../../components/shared/PointerRail'
import IndexedSequence from '../../components/shared/IndexedSequence'
import StackOperationView from '../../components/shared/StackOperationView'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { sequenceSharedKind, toPointerRailProps, toIndexedSequenceProps, toStackOperationProps } from './adapters/sequenceAdapter.js'
import { isCountsContainer, toFrequencyCountProps } from './adapters/countsAdapter.js'

export function sharedVisualFor(container) {
  if (container?.category === 'sequence') {
    const kind = sequenceSharedKind(container)
    if (kind === 'stack') return createElement(StackOperationView, toStackOperationProps(container))
    if (kind === 'pointer-rail') return createElement(PointerRail, toPointerRailProps(container))
    if (kind === 'indexed-sequence') return createElement(IndexedSequence, toIndexedSequenceProps(container))
    return null
  }

  if (container?.category === 'associative' && isCountsContainer(container)) {
    return createElement(FrequencyCountTable, toFrequencyCountProps(container))
  }

  return null
}
