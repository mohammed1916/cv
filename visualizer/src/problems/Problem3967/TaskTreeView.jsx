import './TaskTreeView.css'

const SIZE = 260
const RADIUS = 100

export default function TaskTreeView({ run, step }) {
  const { baseTime, edges } = run.input
  const n = baseTime.length
  const pos = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: SIZE / 2 + RADIUS * Math.cos(angle), y: SIZE / 2 + RADIUS * Math.sin(angle) }
  })
  return (
    <figure className="task-tree" aria-label="Task tree with finish times">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Tree on ${n} nodes`}>
        {edges.map(([a, b], i) => (
          <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} className="task-tree__edge" />
        ))}
        {pos.map((p, v) => {
          const cls = ['task-tree__node', v === step.root ? 'is-root' : '', v === step.node ? 'is-current' : '', step.finished && step.finished[v] !== null ? 'is-done' : ''].filter(Boolean).join(' ')
          return (
            <g key={v} className={cls} transform={`translate(${p.x}, ${p.y})`}>
              <circle r="22" />
              <text className="task-tree__id" y="-3">{`#${v}`}</text>
              <text className="task-tree__time" y="12">{step.finished && step.finished[v] !== null ? step.finished[v] : `b${baseTime[v]}`}</text>
            </g>
          )
        })}
      </svg>
      <dl className="task-tree__stats">
        <div><dt>Root</dt><dd>{step.root ?? '-'}</dd></div>
        <div><dt>Best root</dt><dd>{step.bestRoot ?? '-'}</dd></div>
        <div><dt>Best finish</dt><dd>{step.best ?? '-'}</dd></div>
      </dl>
      <p className="task-tree__legend">Labels show the finish time once a node is done; before that, b is its base time.</p>
    </figure>
  )
}
