import './TripletScanView.css'
import PointerRail from '../../components/shared/PointerRail'

export default function TripletScanView({ run, step }) {
  const { prices, profits } = run.input
  const inBest = i => Array.isArray(step.bestTriple) && step.bestTriple.includes(i)
  const roleOf = i => {
    if (i === step.j) return 'middle'
    if (i === step.scan) return step.phase === 'left' ? 'left scan' : 'right scan'
    return ''
  }
  return (
    <div className="triplet-scan-view">
      <p className="triplet-rule">Fix a middle index j. Its left partner has a smaller price, its right partner a larger price, and the best profits on each side are added.</p>
      <table className="triplet-table">
        <caption>Items by index</caption>
        <thead>
          <tr>
            <th scope="col">index</th>
            {prices.map((_, i) => <th key={i} scope="col">{i}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">price</th>
            {prices.map((p, i) => <td key={i} className={`${i === step.j ? 'is-middle ' : ''}${i === step.scan ? 'is-scan ' : ''}${inBest(i) ? 'is-best' : ''}`}>{p}</td>)}
          </tr>
          <tr>
            <th scope="row">profit</th>
            {profits.map((p, i) => <td key={i} className={inBest(i) ? 'is-best' : ''}>{p}</td>)}
          </tr>
          <tr>
            <th scope="row">role</th>
            {prices.map((_, i) => <td key={i} className="triplet-role">{roleOf(i)}</td>)}
          </tr>
        </tbody>
      </table>
      <PointerRail
        title="Pointers on the prices"
        values={prices}
        pointers={[
          ...(step.j >= 0 ? [{ id: 'j', label: 'j', index: step.j, tone: 'primary' }] : []),
          ...(step.scan >= 0 && step.scan !== undefined ? [{ id: 'scan', label: 'scan', index: step.scan, tone: 'warning' }] : []),
        ]}
      />
      <dl className="triplet-facts">
        <div><dt>Middle j</dt><dd>{step.j >= 0 ? step.j : 'none'}</dd></div>
        <div><dt>Left best</dt><dd>{step.leftBest ?? 'none'}</dd></div>
        <div><dt>Right best</dt><dd>{step.rightBest ?? 'none'}</dd></div>
        <div><dt>Best total</dt><dd>{step.best ?? 'none'}</dd></div>
      </dl>
      <output className="triplet-message" aria-label="Scan status">{step.message}</output>
    </div>
  )
}
