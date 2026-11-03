import './TaskTreeView.css'

function Branch({ node, step, durations }) {
  const kids = step.children[node]
  const isCurrent = step.node === node
  const done = step.finish[node] !== null
  return (
    <li className={`task-tree__node${isCurrent ? ' task-tree__node--current' : ''}${done ? ' task-tree__node--done' : ''}`}>
      <div className="task-tree__card">
        <strong>Task {node}</strong>
        <span>{`base ${durations[node]}`}</span>
        <span className="task-tree__finish">{done ? `finish ${step.finish[node]}` : 'waiting'}</span>
        {kids.length === 0 && <span className="task-tree__kind">leaf</span>}
      </div>
      {kids.length > 0 && (
        <ul className="task-tree__children">
          {kids.map(child => <Branch key={child} node={child} step={step} durations={durations} />)}
        </ul>
      )}
    </li>
  )
}

export default function TaskTreeView({ run, step }) {
  const { durations } = run.input
  return (
    <section className="task-tree" aria-label="Task tree">
      <ul className="task-tree__root">
        <Branch node={0} step={step} durations={durations} />
      </ul>
      {step.ends && <p className="task-tree__ends">{`Child finishes: ${step.ends.join(', ')} (latest ${Math.max(...step.ends)}, earliest ${Math.min(...step.ends)})`}</p>}
      <p className="task-tree__message">{step.message}</p>
    </section>
  )
}
