import './TripletBarsView.css'
import PointerRail from '../../components/shared/PointerRail'

export default function TripletBarsView({ run, step }) {
  const nums = run.input
  const max = Math.max(1, ...nums)
  const role = i => {
    if (step.j === i) return 'middle'
    if (step.leftIndex === i) return 'left'
    if (step.rightIndex === i) return 'right'
    return ''
  }
  return (
    <div className="tbv">
      <div className="tbv__bars" role="img" aria-label="Bars of the input values with the chosen triplet marked">
        {nums.map((value, i) => (
          <div key={i} className={`tbv__col${role(i) ? ` tbv__col--${role(i)}` : ''}`}>
            <span className="tbv__value">{value}</span>
            <span className="tbv__bar" style={{ height: `${(value / max) * 120 + 6}px` }} />
            <span className="tbv__index">{i}</span>
            <span className="tbv__role">{role(i) === 'middle' ? 'j' : role(i) === 'left' ? 'i' : role(i) === 'right' ? 'k' : ''}</span>
          </div>
        ))}
      </div>
      <PointerRail
        title="Pointers on the values"
        values={nums}
        pointers={[
          ...(step.leftIndex >= 0 ? [{ id: 'i', label: 'i', index: step.leftIndex, tone: 'warning' }] : []),
          ...(step.j >= 0 ? [{ id: 'j', label: 'j', index: step.j, tone: 'primary' }] : []),
          ...(step.rightIndex >= 0 ? [{ id: 'k', label: 'k', index: step.rightIndex, tone: 'warning' }] : []),
        ]}
      />
      <dl className="tbv__facts">
        <div><dt>best</dt><dd>{step.best}</dd></div>
        <div><dt>left (i)</dt><dd>{step.left === null ? 'none' : step.left}</dd></div>
        <div><dt>middle (j)</dt><dd>{step.j < 0 ? 'none' : `${nums[step.j]} at ${step.j}`}</dd></div>
        <div><dt>right (k)</dt><dd>{step.right === null ? 'none' : step.right}</dd></div>
      </dl>
      <p className="tbv__note" role="status">{step.message}</p>
    </div>
  )
}
