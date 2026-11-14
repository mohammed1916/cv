import Stack3D from '../viz3d/Stack3D'
import StackqView from './StackqView'
import './StackOperationView.css'

/**
 * A stack drawn as an open cup (top at the top), the values just popped into named variables,
 * and the operation log. `popped` is a list such as [{ name: 'b', value: 3 }].
 */
export default function StackOperationView({ label = 'Stack', items = [], popped = [], stackq = null, emptyText = 'empty' }) {
  return <div className="stack-op-view">
    <div className="stack-op-view__row">
      <div className="stack-op-view__stack">
        <Stack3D label={label} items={items} emptyText={emptyText} highlightIndex={items.length - 1} topBadge="top" />
      </div>
      <div className="stack-op-view__popped" aria-live="polite">
        <strong>Popped into variables</strong>
        {popped.length === 0
          ? <span className="stack-op-view__none">nothing popped</span>
          : popped.map(({ name, value }) => <span key={name} className="stack-op-view__var">{name} = {value}</span>)}
      </div>
    </div>
    {stackq && <StackqView {...stackq} />}
  </div>
}
