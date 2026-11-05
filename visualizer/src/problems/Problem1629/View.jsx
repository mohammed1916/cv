import IntervalView from '../../components/shared/IntervalView'

// Each press is a bar from its previous release to its own release; the slowest press is highlighted.
export default function View({ run, step }) {
  const { releaseTimes, keysPressed } = run.input
  const upTo = step.phase === 'done' ? keysPressed.length - 1 : step.index
  const intervals = releaseTimes.map((end, i) => ({
    start: i === 0 ? 0 : releaseTimes[i - 1],
    end,
    label: `${keysPressed[i]} ${run.durations[i]}`,
    role: i === step.index ? 'active' : i <= upTo ? 'done' : 'pending',
  }))
  const slowest = releaseTimes.findIndex((_, i) => keysPressed[i] === step.snapshot.best && run.durations[i] === step.snapshot.bestDuration)
  return <div className="slowest-key-view">
    <IntervalView title="Key presses on a time line" intervals={intervals} />
    <dl>
      <dt>Slowest so far</dt><dd>{step.snapshot.best} ({step.snapshot.bestDuration})</dd>
      <dt>Position</dt><dd>{slowest >= 0 ? slowest + 1 : '-'}</dd>
    </dl>
  </div>
}
