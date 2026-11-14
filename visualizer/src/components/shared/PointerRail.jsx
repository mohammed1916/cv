import { motion } from 'framer-motion'
import './PointerRail.css'

/** A compact, reusable reading aid for index-based algorithms. */
export default function PointerRail({
  title = 'Pointers',
  values = [],
  pointers = [],
  range = null,
  partition = null,
  highlight = [],
  roleAt = null,
  marks = [],
  cellWidth = null,
  scrollable = true,
  terminator = null,
  note,
}) {
  return (
    <section className="pointer-rail" aria-label={title}>
      <header className="pointer-rail-head">
        <strong>{title}</strong>
        {range && <span>search window: {range.start}–{range.end}</span>}
      </header>
      <div className="pointer-rail-track" style={scrollable ? undefined : { overflowX: 'visible' }}>
        <div
          className="pointer-rail-canvas"
          style={{ gridTemplateColumns: `repeat(${Math.max(values.length, 1)}, ${cellWidth ? `${cellWidth}px` : 'minmax(38px, 1fr)'})${terminator ? ' minmax(56px, auto)' : ''}` }}
        >
        {values.map((value, index) => {
          const at = pointers.filter((pointer) => !pointer.boundary && pointer.index === index)
          const inRange = !range || (index >= range.start && index <= range.end)
          const lastPointer = at[at.length - 1]
          const markTone = marks.find((mark) => mark.index === index)?.tone
          const role = roleAt ? roleAt(index) : ''
          return (
            <div key={`${index}-${value}`} className={`pointer-rail-slot ${inRange ? 'in-range' : 'outside-range'}`}>
              <div className="pointer-rail-tags">
                {at.map((pointer) => <motion.span layout key={pointer.id} className={`pointer-rail-tag ${pointer.tone || 'primary'}`}>{pointer.label}</motion.span>)}
              </div>
              <div className={`pointer-rail-cell ${at.length ? `pointed pointed-${lastPointer.tone || 'primary'}` : ''} ${markTone ? `mark-${markTone}` : ''} ${highlight.includes(index) ? 'highlighted' : ''} ${partition !== null && index < partition ? 'left-partition' : ''} ${partition !== null && index >= partition ? 'right-partition' : ''} ${role ? `role-${role}` : ''}`}>{value}</div>
              <span className="pointer-rail-index">{index}</span>
            </div>
          )
        })}
        {terminator && (
          <div className="pointer-rail-slot pointer-rail-terminator">
            <div className="pointer-rail-tags" aria-hidden="true" />
            <div className="pointer-rail-cell">{terminator}</div>
            <span className="pointer-rail-index" aria-hidden="true">&nbsp;</span>
          </div>
        )}
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
