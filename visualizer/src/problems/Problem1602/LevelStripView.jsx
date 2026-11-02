import './LevelStripView.css'

// Tree drawn as horizontal strips, one per level, left to right. The target u is outlined and its answer is green.
export default function LevelStripView({ run, step }) {
  const { tree, u } = run.input
  const levels = []
  let current = [0]
  while (current.length) {
    levels.push(current)
    current = current.flatMap(node => step.kids[node] || [])
  }
  return (
    <figure className="ls-view">
      {levels.map((level, depth) => (
        <div key={depth} className={`ls-row${level.some(node => step.level.includes(node)) ? ' ls-row--active' : ''}`}>
          <span className="ls-depth">level {depth}</span>
          {level.map((node, index) => {
            const cls = [
              'ls-cell',
              node === u ? 'ls-cell--target' : '',
              step.result !== null && node === step.result ? 'ls-cell--answer' : '',
              step.phase === 'scan' && node === step.node ? 'ls-cell--scan' : '',
            ].join(' ')
            return (
              <span key={node} className={cls} aria-label={`position ${node}, value ${tree[node]}`}>
                <b>{tree[node]}</b>
                <small>pos {node}</small>
                {node === u && <em>u</em>}
                {index === level.length - 1 && <i className="ls-end">rightmost</i>}
              </span>
            )
          })}
        </div>
      ))}
      <figcaption>{step.message}</figcaption>
    </figure>
  )
}
