import './AlgorithmWorkspace.css'
import { useState } from 'react'

// A window into the full collection, never a truncated replacement for it.
// `lift` is off by default. `true` uses the default lift; an object such as { scale: 1.3, y: -8 } tunes it.
// Only the active cell lifts. The transition is disabled under prefers-reduced-motion (see AlgorithmWorkspace.css).
const DEFAULT_LIFT = { scale: 1.15, y: -6 }

export default function IndexedSequence({ label, length, valueAt, active = -1, roleAt = () => '', indexOffset = 0, lift = false }) {
  const [selectedPage, setSelectedPage] = useState(null)
  const pageSize = 32
  const lastPage = Math.max(0, Math.ceil(length / pageSize) - 1)
  const page = selectedPage === null ? Math.max(0, Math.floor(active / pageSize)) : Math.min(selectedPage, lastPage)
  const start = page * pageSize
  const end = Math.min(length, start + pageSize)
  const liftSpec = lift === true ? DEFAULT_LIFT : lift || null
  return <section className="algorithm-sequence" aria-label={label}>
    <h3>{label}</h3>
    <div className="algorithm-sequence__cells">{Array.from({ length: end - start }, (_, offset) => {
      const index = start + offset
      const role = roleAt(index)
      const isLifted = Boolean(liftSpec) && index === active
      const liftStyle = isLifted ? { '--sequence-lift-scale': liftSpec.scale ?? 1, '--sequence-lift-y': `${liftSpec.y ?? 0}px` } : undefined
      return <div key={index} data-chat-selectable data-index={index + indexOffset} data-chat-label={`${label} [${index + indexOffset}]`} className={`algorithm-sequence__cell ${index === active ? 'is-active' : ''} ${isLifted ? 'is-lifted' : ''}`} style={liftStyle} data-role={role}>
        <small>[{index + indexOffset}]</small><strong>{valueAt(index)}</strong><span>{index === active ? 'current' : role || '\u00a0'}</span>
      </div>
    })}</div>
    {length > pageSize && <nav aria-label={`${label} pages`}>
      <button disabled={page === 0} onClick={() => setSelectedPage(page - 1)}>Previous page</button>
      <span>{start + 1}–{end} of {length}</span>
      <button disabled={page === lastPage} onClick={() => setSelectedPage(page + 1)}>Next page</button>
      <button onClick={() => setSelectedPage(null)}>Follow current</button>
    </nav>}
  </section>
}
