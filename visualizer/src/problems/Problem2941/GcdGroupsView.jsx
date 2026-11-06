import './GcdGroupsView.css'
import PointerRail from '../../components/shared/PointerRail'

export default function GcdGroupsView({ run, step }) {
  const { nums, k } = run.input
  const [bestStart, bestEnd] = step.bestRange ?? [-1, -1]
  const cand = step.candidate
  const inBest = i => i >= bestStart && i <= bestEnd && bestStart >= 0
  return (
    <div className="gcd-groups-view">
      <p className="gcd-rule">Only the smallest start for each gcd matters, because a longer run with the same gcd has a larger sum. Length must be at least {k}.</p>
      <ol className="gcd-strip" aria-label="Numbers">
        {nums.map((x, i) => {
          const classes = ['gcd-cell']
          if (i === step.r) classes.push('is-end')
          if (cand && i >= cand.s && i <= step.r) classes.push('is-span')
          if (inBest(i)) classes.push('is-best')
          return (
            <li key={i} className={classes.join(' ')}>
              <span className="gcd-index">{i}</span>
              <strong>{x}</strong>
            </li>
          )
        })}
      </ol>
      <table className="gcd-table">
        <caption>Groups ending at r = {step.r >= 0 ? step.r : 'none'}</caption>
        <thead><tr><th scope="col">gcd</th><th scope="col">start</th><th scope="col">length</th></tr></thead>
        <tbody>
          {step.groups.length === 0 && <tr><td colSpan={3}>No groups yet</td></tr>}
          {step.groups.map(group => {
            const length = step.r - group.s + 1
            return (
              <tr key={`${group.g}-${group.s}`} className={cand && cand.g === group.g && cand.s === group.s ? 'is-active' : length < k ? 'is-short' : ''}>
                <th scope="row">{group.g}</th>
                <td>{group.s}</td>
                <td>{length}{length < k ? ' (too short)' : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <PointerRail
        title="Pointers on the numbers"
        values={nums}
        pointers={[
          ...(cand && cand.s >= 0 ? [{ id: 's', label: 's', index: cand.s, tone: 'warning' }] : []),
          ...(step.r >= 0 ? [{ id: 'r', label: 'r', index: step.r, tone: 'primary' }] : []),
        ]}
      />
      <output className="gcd-message" aria-label="Group status">{step.message}</output>
      <p className="gcd-best">Best product: {step.best}{bestStart >= 0 ? ` from indices ${bestStart} to ${bestEnd}` : ''}</p>
    </div>
  )
}
