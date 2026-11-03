import './TimelineMeetingView.css'

const LEFT = 90
const WIDTH = 520
const LANE_H = 46

export default function TimelineMeetingView({ run, step }) {
  const { slots1, slots2, duration } = run.input
  const all = [...slots1, ...slots2]
  const lo = Math.min(...all.map(s => s[0]))
  const hi = Math.max(...all.map(s => s[1]))
  const scale = t => LEFT + ((t - lo) / Math.max(1, hi - lo)) * (WIDTH - LEFT - 20)
  const lanes = [
    { name: 'Person 1', slots: slots1, pointer: step.i, key: 'first' },
    { name: 'Person 2', slots: slots2, pointer: step.j, key: 'second' },
  ]
  const height = LANE_H * 2 + 70
  const hasOverlap = step.start !== null && step.end !== null
  return <div className="timeline-view">
    <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img"
      aria-label={`Availability timelines, ${step.meeting ? `meeting ${step.meeting.join(' to ')}` : 'searching'}`}>
      {hasOverlap && <rect className="timeline-view__overlap" x={scale(step.start)} y={8}
        width={Math.max(2, scale(step.end) - scale(step.start))} height={LANE_H * 2 + 30} />}
      {lanes.map((lane, row) => {
        const y = 24 + row * LANE_H
        return <g key={lane.key}>
          <text x={6} y={y + 16} className="timeline-view__name">{lane.name}</text>
          <line x1={LEFT} x2={WIDTH - 10} y1={y + 18} y2={y + 18} className="timeline-view__axis" />
          {lane.slots.map((slot, k) => {
            const classes = ['timeline-view__slot']
            if (k === lane.pointer) classes.push('is-pointer')
            return <g key={k}>
              <rect className={classes.join(' ')} x={scale(slot[0])} y={y + 4} width={scale(slot[1]) - scale(slot[0])} height={22} rx={4} />
              <text x={scale(slot[0]) + 4} y={y + 19} className="timeline-view__label">{slot[0]}–{slot[1]}</text>
            </g>
          })}
        </g>
      })}
      {step.meeting && <rect className="timeline-view__meeting" x={scale(step.meeting[0])} y={LANE_H * 2 + 36}
        width={scale(step.meeting[1]) - scale(step.meeting[0])} height={18} rx={4} />}
      {step.meeting && <text x={scale(step.meeting[0])} y={LANE_H * 2 + 50} className="timeline-view__label">meeting {step.meeting[0]}–{step.meeting[1]}</text>}
      <text x={LEFT} y={height - 6} className="timeline-view__label">time {lo} to {hi} · needs {duration}</text>
    </svg>
    <output aria-label="Overlap readout">
      {hasOverlap ? `overlap ${step.start}–${step.end} (length ${step.end - step.start}, need ${duration})` : 'slots sorted by start'}
    </output>
  </div>
}
