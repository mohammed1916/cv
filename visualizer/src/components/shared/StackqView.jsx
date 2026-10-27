import { describeStackqOps } from './stackqModel.js'
import './StackqView.css'

const ENDS = {
  stack: ['bottom', 'top: push and pop here'],
  queue: ['front: dequeue here', 'back: enqueue here'],
  deque: ['front: push and pop here', 'back: push and pop here'],
}

function Chip({ label, role }) {
  return <b className={`stackq-view__chip${role ? ` is-${role}` : ''}`}>{label}</b>
}

/**
 * Stacks, queues and deques with their open ends, the elements just added or removed, and a plain
 * sentence (with the reason) for every operation since the previous step.
 */
export default function StackqView({ lanes = [], ops = [] }) {
  const lines = describeStackqOps(ops)
  return <section className="stackq-view" aria-label="Stack and queue state">
    <h3>{lanes.length === 1 ? lanes[0].name : 'Stacks and queues'}</h3>
    {lines.length > 0 && <ol className="stackq-view__ops" aria-label="Operations this step">
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ol>}
    {lanes.map(lane => {
      const [left, right] = ENDS[lane.kind] ?? ENDS.stack
      const front = lane.removed.filter(r => r.end === 'front')
      const back = lane.removed.filter(r => r.end === 'back')
      return <div className="stackq-view__lane" key={lane.name} aria-label={`${lane.name} (${lane.kind})`}>
        <span className="stackq-view__name">{lane.name} <small>{lane.kind}</small></span>
        <div className="stackq-view__row">
          {front.map((r, i) => <Chip key={`f${i}`} label={r.label} role="removed" />)}
          <span className="stackq-view__end">{left}</span>
          <div className="stackq-view__cells">
            {lane.items.length
              ? lane.items.map((item, i) => <Chip key={i} label={item.label} role={item.fresh ? 'fresh' : item.kept ? 'kept' : ''} />)
              : <em>empty</em>}
          </div>
          <span className="stackq-view__end">{right}</span>
          {back.map((r, i) => <Chip key={`b${i}`} label={r.label} role="removed" />)}
        </div>
      </div>
    })}
    <p className="stackq-view__legend">
      <span className="is-fresh">just added</span>
      <span className="is-kept">inspected and kept</span>
      <span className="is-removed">just removed</span>
    </p>
  </section>
}
