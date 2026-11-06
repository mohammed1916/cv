import './FenwickTripletView.css'
import PointerRail from '../../components/shared/PointerRail'

export default function FenwickTripletView({ run, step }) {
  const { prices, profits } = run.input
  const cellClass = i => {
    const classes = []
    if (i === step.j) classes.push('is-current')
    if (step.bestMiddle === i) classes.push('is-best')
    return classes.join(' ')
  }
  const tree = step.tree ?? []
  return (
    <div className="fenwick-triplet-view">
      <p className="fenwick-rule">Two sweeps build the best partner on each side with a max Fenwick tree over price ranks. The middle index then combines them.</p>
      <table className="fenwick-table">
        <caption>Per index</caption>
        <thead>
          <tr>
            <th scope="col">index</th>
            {prices.map((_, i) => <th key={i} scope="col" className={cellClass(i)}>{i}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">price</th>{prices.map((p, i) => <td key={i} className={cellClass(i)}>{p}</td>)}</tr>
          <tr><th scope="row">profit</th>{profits.map((p, i) => <td key={i} className={cellClass(i)}>{p}</td>)}</tr>
          <tr><th scope="row">left best</th>{prices.map((_, i) => <td key={i}>{step.left?.[i] ?? '-'}</td>)}</tr>
          <tr><th scope="row">right best</th>{prices.map((_, i) => <td key={i}>{step.right?.[i] ?? '-'}</td>)}</tr>
        </tbody>
      </table>
      <PointerRail
        title="Pointer on the prices"
        values={prices}
        pointers={step.j >= 0 ? [{ id: 'j', label: 'j', index: step.j, tone: 'primary' }] : []}
      />
      <div className="fenwick-tree" aria-label="Fenwick tree of best profits by rank">
        <span className="fenwick-label">Fenwick tree (index 0 unused)</span>
        <ol>
          {tree.slice(1).map((v, i) => (
            <li key={i} className={v === null ? 'is-empty' : ''}>
              <span className="fenwick-rank">{i + 1}</span>
              <strong>{v === null ? 'empty' : v}</strong>
            </li>
          ))}
        </ol>
      </div>
      <output className="fenwick-message" aria-label="Sweep status">{step.message}</output>
      <p className="fenwick-best">Best total: {step.best ?? 'none'}</p>
    </div>
  )
}
