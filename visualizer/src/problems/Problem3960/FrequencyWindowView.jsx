import PointerRail from '../../components/shared/PointerRail'
import './FrequencyWindowView.css'

export default function FrequencyWindowView({ run, step }) {
  const values = run.input
  const inWindow = i => step.l >= 0 && step.r >= step.l && i >= step.l && i <= step.r
  const maxCount = Math.max(1, ...step.counts.map(([, c]) => c))
  const pointers = [
    ...(step.l >= 0 ? [{ id: 'l', label: 'l', index: step.l, tone: 'primary' }] : []),
    ...(step.r >= 0 && step.r >= step.l ? [{ id: 'r', label: 'r', index: step.r, tone: 'success' }] : []),
  ]
  return (
    <section className="freq-window" aria-label="Frequency window">
      <PointerRail title="Array with window pointers" values={values} pointers={pointers} />
      <div className="freq-window__cells" role="list" aria-label="Array values">
        {values.map((v, i) => (
          <div key={i} role="listitem" className={`freq-window__cell${inWindow(i) ? ' freq-window__cell--in' : ''}${step.bestRange && i >= step.bestRange[0] && i <= step.bestRange[1] ? ' freq-window__cell--best' : ''}`}>
            <span>{v}</span><small>{i}</small>
          </div>
        ))}
      </div>
      <div className="freq-window__bars" aria-label="Frequency of each value in the window">
        {step.counts.length === 0 && <p>No window yet.</p>}
        {step.counts.map(([value, count]) => (
          <div key={value} className="freq-window__row">
            <span className="freq-window__label">{value}</span>
            <span className="freq-window__bar" style={{ width: `${(count / maxCount) * 100}%` }}>{count}</span>
          </div>
        ))}
      </div>
      <p className="freq-window__levels">{step.levels && step.levels.length ? `Frequency levels: ${step.levels.join(', ')}` : ''}</p>
      <output aria-label="Best length so far">{`Best length so far: ${step.best}`}</output>
    </section>
  )
}
