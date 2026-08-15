import { motion } from 'framer-motion'
import './PointerRail.css'

/** A compact, reusable reading aid for index-based algorithms. */
export default function PointerRail({
  title = 'Pointers',
  values = [],
  pointers = [],
  range = null,
  partition = null,
  note,
}) {
  return (
    <section className="pointer-rail" aria-label={title}>
      <header className="pointer-rail-head">
        <strong>{title}</strong>
        {range && <span>search window: {range.start}–{range.end}</span>}
      </header>
      <div className="pointer-rail-track">
        <div
          className="pointer-rail-canvas"
          style={{ gridTemplateColumns: `repeat(${Math.max(values.length, 1)}, minmax(38px, 1fr))` }}
        >
        {values.map((value, index) => {
          const at = pointers.filter((pointer) => !pointer.boundary && pointer.index === index)
          const inRange = !range || (index >= range.start && index <= range.end)
          return (
            <div key={`${index}-${value}`} className={`pointer-rail-slot ${inRange ? 'in-range' : 'outside-range'}`}>
              <div className="pointer-rail-tags">
                {at.map((pointer) => <motion.span layout key={pointer.id} className={`pointer-rail-tag ${pointer.tone || 'primary'}`}>{pointer.label}</motion.span>)}
              </div>
              <div className={`pointer-rail-cell ${at.length ? 'pointed' : ''} ${partition !== null && index < partition ? 'left-partition' : ''} ${partition !== null && index >= partition ? 'right-partition' : ''}`}>{value}</div>
              <span className="pointer-rail-index">{index}</span>
            </div>
          )
        })}
        <div className="pointer-rail-boundaries" aria-hidden="true">
          {pointers.filter((pointer) => pointer.boundary).map((pointer) => (
            <motion.div
              layout
              key={pointer.id}
              className={`pointer-rail-boundary ${pointer.tone || 'primary'}`}
              style={{ left: `${(pointer.index / Math.max(values.length, 1)) * 100}%` }}
            >
              <span>{pointer.label}</span>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
      {note && <p className="pointer-rail-note">{note}</p>}
    </section>
  )
}
