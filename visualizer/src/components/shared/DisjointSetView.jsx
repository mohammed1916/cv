import IndexedSequence from './IndexedSequence'
import RootedTreeDiagram from './RootedTreeDiagram'
import { describeDisjointSetOps, disjointSetForest } from './disjointSetModel.js'
import './DisjointSetView.css'

/**
 * Union-find state with its operations: the parent array, the forest of sets, and what each find and
 * union just did. `ops` come from AuthoredUnionFind (find chains, path compression, union by size).
 */
export default function DisjointSetView({ parent, size, labels, ops = [] }) {
  const names = labels ?? parent.map(String)
  const label = i => names[i]
  const { roots, idOf } = disjointSetForest(parent, names)
  const touched = {}
  for (const op of ops) {
    if (op.type === 'find') {
      op.chain.forEach(i => { touched[idOf(i)] = 'focus' })
      op.repointed.forEach(r => { touched[idOf(r.node)] = 'target' })
      touched[idOf(op.root)] = 'best'
    } else if (op.merged) {
      touched[idOf(op.winner)] = 'best'
      touched[idOf(op.loser)] = 'new'
    }
  }
  const lines = describeDisjointSetOps(ops, label)
  return <section className="dsu-view" aria-label="Union-find state">
    <h3>Union-find</h3>
    {lines.length > 0 && <ol className="dsu-view__ops" aria-label="Operations this step">
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ol>}
    <IndexedSequence label="parent[] — each element points to its parent; a root points to itself" length={parent.length}
      valueAt={i => names[parent[i]]} roleAt={i => (parent[i] === i ? `root, size ${size[i]}` : '')} />
    <div className="dsu-view__forest" aria-label="Sets as trees">
      {roots.map(root => <RootedTreeDiagram key={root.id} title={`Set rooted at ${root.id}`} root={root} roles={touched} />)}
    </div>
    <p className="dsu-view__legend">
      <span className="is-focus">walked by find</span>
      <span className="is-target">re-pointed by compression</span>
      <span className="is-best">root / merge winner</span>
      <span className="is-new">merged under another root</span>
    </p>
  </section>
}
