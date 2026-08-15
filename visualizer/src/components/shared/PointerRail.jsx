import { motion } from 'framer-motion'
import './PointerRail.css'

/** A compact, reusable reading aid for index-based algorithms. */
export default function PointerRail({
  title = 'Pointers',
  values = [],
  pointers = [],
  range = null,
  note,
}) {
  return (
    <section className="pointer-rail" aria-label={title}>
      <header className="pointer-rail-head">
        <strong>{title}</strong>
        {range && <span>search window: {range.start}–{range.end}</span>}
      </header>
      <div className="pointer-rail-track">
        {values.map((value, index) => {
          const at = pointers.filter((pointer) => pointer.index === index)
          const inRange = !range || (index >= range.start && index <= range.end)
          return (
            <div key={`${index}-${value}`} className={`pointer-rail-slot ${inRange ? 'in-range' : 'outside-range'}`}>
              <div className="pointer-rail-tags">
                {at.map((pointer) => <motion.span layout key={pointer.id} className={`pointer-rail-tag ${pointer.tone || 'primary'}`}>{pointer.label}</motion.span>)}
              </div>
              <div className={`pointer-rail-cell ${at.length ? 'pointed' : ''}`}>{value}</div>
              <span className="pointer-rail-index">{index}</span>
            </div>
          )
        })}
      </div>
      {note && <p className="pointer-rail-note">{note}</p>}
    </section>
  )
}
