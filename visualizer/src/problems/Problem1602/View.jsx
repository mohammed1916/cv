// Level-by-level strip: each level is a row; the current level, u and its right neighbour are highlighted.
export default function View({ run, step }) {
  const { tree, u } = run.input
  const levels = run.levels.length ? run.levels : [[0]]
  const current = step.level ?? []
  const scanning = step.scanning
  return <section className="nearest-right-view" aria-label="Level order">
    {levels.map((row, depth) => {
      const isCurrent = row.length === current.length && row.every((p, i) => p === current[i])
      return <div key={depth} className={`nearest-right-view__level ${isCurrent ? 'is-current' : ''}`} data-depth={depth}>
        <small>level {depth}</small>
        {row.map((p, i) => {
          const isU = tree[p] === u
          const isNeighbour = step.index !== undefined && step.index >= 0 && i === step.index + 1 && isCurrent
          const cls = [isU ? 'is-u' : '', p === scanning ? 'is-scan' : '', isNeighbour ? 'is-answer' : ''].join(' ')
          return <span key={p} className={`nearest-right-view__node ${cls}`} data-position={p}>
            {tree[p]}{isU ? ' (u)' : ''}
          </span>
        })}
      </div>
    })}
    <p>{step.phase === 'done' ? `Answer: ${step.result ?? 'null'}` : `Looking for u = ${u}`}</p>
  </section>
}
