import IndexedSequence from '../../components/shared/IndexedSequence'

const KIND = { up: 'moves up', stay: 'stays', down: 'enters' }

export default function View({ run, step }) {
  const logs = run.input
  const depth = step.snapshot.depth
  const path = []
  for (let i = 0; i <= Math.min(step.index, logs.length - 1); i++) {
    if (logs[i] === '../') path.pop()
    else if (logs[i] !== './') path.push(logs[i].replace('/', ''))
  }
  const folders = Array.from({ length: Math.max(depth, 0) }, (_, k) => path[k] ?? '…')
  return <div className="crawler-view">
    <IndexedSequence label="Operations" length={logs.length} active={step.index}
      valueAt={i => logs[i]} roleAt={i => (i < step.index ? 'done' : '')} />
    <section aria-label="Folder depth">
      <h3>Folder depth {depth}</h3>
      <ol className="crawler-view__path">
        <li data-depth="0">main</li>
        {folders.map((name, k) => <li key={k} data-depth={k + 1}>{name}</li>)}
      </ol>
      <p>{step.index >= 0 ? `Last operation ${logs[step.index]} ${KIND[step.kind] ?? ''}`.trim() : 'No operation applied yet.'}</p>
    </section>
  </div>
}
