import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import './PrefixChain.css'

// Prefix products since the last zero. A zero starts a new chain; each non-zero value appends prefix * value.
// Cells are keyed by chain epoch and position, so only new cells animate in and a reset animates the old chain out.
export function prefixChainModel(values) {
  let epoch = 0
  let product = 1
  let cells = [{ key: '0-0', value: 1 }]
  for (const value of values) {
    if (value === 0) {
      epoch++
      product = 1
      cells = [{ key: `${epoch}-0`, value: 1, reset: true }]
    } else {
      product *= value
      cells = [...cells, { key: `${epoch}-${cells.length}`, value: product }]
    }
  }
  return { cells, epoch }
}

export default function PrefixChain({ values, query = null, title = 'Prefix products since the last zero' }) {
  const reduced = useReducedMotion()
  const { cells } = prefixChainModel(values)
  const last = cells.length - 1
  const count = last // numbers since the last zero
  const hasQuery = query && query.k !== undefined && query.k !== null
  const reachesZero = hasQuery && query.k > count
  const from = hasQuery && !reachesZero ? last - query.k : null
  const duration = reduced ? 0 : 0.35
  return <section className="prefix-chain" aria-label={title}>
    <h3>{title}</h3>
    <div className="prefix-chain__cells">
      <AnimatePresence initial={false}>
        {cells.map((cell, index) => <motion.div key={cell.key} layout
          className={`prefix-chain__cell ${index === last && hasQuery && !reachesZero ? 'is-end' : ''} ${index === from ? 'is-start' : ''} ${cell.reset ? 'is-reset' : ''}`}
          initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }}
          transition={{ duration }}>
          <small>p[{index}]</small><strong>{cell.value}</strong>
        </motion.div>)}
      </AnimatePresence>
    </div>
    {hasQuery && <p className="prefix-chain__formula" aria-live="polite">
      {reachesZero
        ? `k = ${query.k} reaches past the last zero, so the product is 0.`
        : `p[${last}] ÷ p[${from}] = ${cells[last].value} ÷ ${cells[from].value} = ${query.answer ?? cells[last].value / cells[from].value}`}
    </p>}
  </section>
}
