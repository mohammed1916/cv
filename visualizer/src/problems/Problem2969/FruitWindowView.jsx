import './FruitWindowView.css'
import PointerRail from '../../components/shared/PointerRail'

export default function FruitWindowView({ run, step }) {
  const { prices } = run.input
  const n = prices.length
  const [wStart, wEnd] = step.window ?? [-1, -1]
  const dequeSet = new Set((step.deque ?? []).map(d => d.index))
  // Costs are filled from the back: fruit i is known once the scan has reached it.
  const computed = i => step.phase === 'done' || (step.i >= 1 && i > step.i) || (step.phase === 'compute' && i === step.i)
  return (
    <div className="fruit-window-view">
      <p className="fruit-rule">Buying fruit i makes the next i fruits free. Work from the last fruit back: each fruit's cost is its price plus the cheapest valid next purchase.</p>
      <ol className="fruit-strip" aria-label="Fruits with prices and costs">
        {prices.map((price, idx) => {
          const i = idx + 1
          const classes = ['fruit-cell']
          if (i === step.i) classes.push('is-current')
          if (wStart >= 0 && i >= wStart && i <= wEnd) classes.push('is-window')
          if (dequeSet.has(i)) classes.push('is-candidate')
          return (
            <li key={i} className={classes.join(' ')}>
              <span className="fruit-index">fruit {i}</span>
              <strong>{price}</strong>
              <span className="fruit-cost">cost {computed(i) ? step.costs[idx] : '-'}</span>
            </li>
          )
        })}
        <li key="tail" className={`fruit-cell is-tail${dequeSet.has(n + 1) ? ' is-candidate' : ''}`}>
          <span className="fruit-index">after {n}</span>
          <strong>0</strong>
          <span className="fruit-cost">cost 0</span>
        </li>
      </ol>
      <PointerRail
        title="Pointers on the prices"
        values={prices}
        pointers={[
          ...(step.i >= 1 ? [{ id: 'i', label: 'i', index: step.i - 1, tone: 'primary' }] : []),
          ...(wStart >= 1 ? [{ id: 'l', label: 'l', index: wStart - 1, tone: 'warning' }] : []),
          ...(wEnd >= 1 ? [{ id: 'r', label: 'r', index: Math.min(wEnd, n) - 1, tone: 'warning' }] : []),
        ]}
      />
      <p className="fruit-deque">Candidates (front to back): {(step.deque ?? []).map(d => (d.index === n + 1 ? 'end' : d.index)).join(', ') || 'none'}</p>
      <p className="fruit-window">Reach window: {wStart >= 0 ? `fruits ${wStart} to ${Math.min(wEnd, n + 1)}` : 'none yet'}</p>
      <output className="fruit-message" aria-label="Deque status">{step.message}</output>
    </div>
  )
}
