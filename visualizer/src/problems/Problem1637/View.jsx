import IntervalView from '../../components/shared/IntervalView'

// The x axis with the sorted points; the gap being measured is highlighted.
export default function View({ run, step }) {
  const { xs } = run
  const upTo = step.index ?? -1
  const intervals = xs.slice(1).map((x, k) => ({
    start: xs[k],
    end: x,
    label: `${x - xs[k]}`,
    role: step.phase === 'done' || k + 1 < upTo ? 'done' : k + 1 === upTo ? 'active' : 'pending',
  }))
  return <div className="widest-area-view">
    <IntervalView title="Gaps between neighbouring x values" intervals={intervals} />
    <p>Widest so far: {step.snapshot.widest ?? 0}</p>
  </div>
}
