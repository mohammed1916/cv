import { useState } from 'react'

// A window into the full collection, never a truncated replacement for it.
export default function IndexedSequence({ label, length, valueAt, active = -1, roleAt = () => '', indexOffset = 0 }) {
  const [selectedPage, setSelectedPage] = useState(null)
  const pageSize = 32
  const lastPage = Math.max(0, Math.ceil(length / pageSize) - 1)
  const page = selectedPage === null ? Math.max(0, Math.floor(active / pageSize)) : Math.min(selectedPage, lastPage)
  const start = page * pageSize
  const end = Math.min(length, start + pageSize)
  return <section className="algorithm-sequence" aria-label={label}>
    <h3>{label}</h3>
    <div className="algorithm-sequence__cells">{Array.from({ length: end - start }, (_, offset) => {
      const index = start + offset
      const role = roleAt(index)
      return <div key={index} className={`algorithm-sequence__cell ${index === active ? 'is-active' : ''}`} data-role={role}>
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
