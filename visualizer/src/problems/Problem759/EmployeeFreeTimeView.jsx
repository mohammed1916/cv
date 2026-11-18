import './EmployeeFreeTimeView.css'
import IntervalView from '../../components/shared/IntervalView'

export default function EmployeeFreeTimeView({ run, step }) {
  const schedules = run.input
  const currentItem = step.current >= 0 ? step.items[step.current] : null
  const intervals = schedules.flatMap((busy, owner) => busy.map(([start, end]) => {
    const isCurrent = Boolean(currentItem && currentItem.owner === owner && currentItem.start === start && currentItem.end === end)
    const isDone = step.reach !== null && end <= step.reach && !isCurrent
    return { start, end, group: `Employee ${owner}`, role: isCurrent ? 'current' : isDone ? 'done' : 'pending' }
  }))
  const gaps = step.free.length ? step.free.map(([a, b]) => `[${a}, ${b}]`).join(' ') : 'none yet'
  return (
    <figure className="eft" aria-label="Busy intervals for each employee on one time axis">
      <IntervalView
        title="Busy intervals"
        intervals={intervals}
        marker={step.reach}
        markerLabel="reach"
        note="The marker is the reach: the latest end seen so far."
      />
      <figcaption className="eft__status">
        <span>Reach: {step.reach === null ? 'none yet' : step.reach}</span>
        <span>Free gaps: {gaps}</span>
        {currentItem && <span>Next interval: [{currentItem.start}, {currentItem.end}]</span>}
      </figcaption>
    </figure>
  )
}
