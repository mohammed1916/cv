import './RopeTreeView.css'

const label = path => (path === '' ? 'root' : path)

function nodeAt(root, path) {
  let node = root
  for (const c of path) node = c === 'L' ? node.left : node.right
  return node
}

function RopeNode({ node, path, step }) {
  const isLeaf = node.text !== undefined
  const current = step.path === path
  const seen = (step.visited || []).includes(path)
  const classes = ['rope-node', isLeaf ? 'leaf' : 'internal', current ? 'current' : '', seen ? 'seen' : ''].filter(Boolean).join(' ')
  return (
    <div className="rope-branch">
      <div className={classes} aria-label={`Node ${label(path)}, length ${node.len}${isLeaf ? `, text ${node.text}` : ''}`}>
        <strong>{label(path)}</strong>
        <span>len {node.len}</span>
        {isLeaf ? <code>{node.text}</code> : <span className="kind">concatenation</span>}
      </div>
      {!isLeaf && (
        <div className="rope-children">
          <div className="rope-side">
            <span className={step.goTo === 'left' && current ? 'taken' : ''}>left</span>
            <RopeNode node={node.left} path={path + 'L'} step={step} />
          </div>
          <div className="rope-side">
            <span className={step.goTo === 'right' && current ? 'taken' : ''}>right</span>
            <RopeNode node={node.right} path={path + 'R'} step={step} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function RopeTreeView({ run, step }) {
  const sub = nodeAt(run.input.root, step.path || '')
  const pick = step.index
  return (
    <section className="rope-view" aria-label="Rope tree descent">
      <div className="rope-tree">
        <RopeNode node={run.input.root} path="" step={step} />
      </div>
      <div className="rope-positions" aria-label={`Positions inside ${label(step.path || '')}`}>
        <span className="rope-caption">Positions inside {label(step.path || '')} (length {sub.len})</span>
        <div className="rope-bar">
          {Array.from({ length: sub.len }, (_, i) => (
            <span key={i} className={i + 1 === pick ? 'pick' : ''}>{i + 1}</span>
          ))}
        </div>
      </div>
      <output aria-label="Remaining index">{`index ${pick} inside ${label(step.path || '')}`}</output>
    </section>
  )
}
