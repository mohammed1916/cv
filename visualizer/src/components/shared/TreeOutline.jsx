import './TreeOutline.css'

/**
 * Indented outline of any rooted tree, including N-ary trees that a binary
 * lane cannot draw. Nodes are { id, value, children }; `roles` maps an id to
 * 'active' | 'visited' | 'match' | 'pruned' and `tags` adds a short label.
 */
export default function TreeOutline({ title = 'Tree', root = null, roles = {}, tags = {}, note }) {
  return <section className="tree-outline" aria-label={title}>
    <header><strong>{title}</strong>{note && <span>{note}</span>}</header>
    {root ? <TreeNode node={root} roles={roles} tags={tags} /> : <em>empty tree</em>}
  </section>
}

function TreeNode({ node, roles, tags }) {
  const role = roles[node.id] || ''
  return <ul className="tree-outline__list">
    <li>
      <span className={`tree-outline__node ${role ? 'is-' + role : ''}`} data-role={role || undefined}>
        <b>{String(node.value)}</b>{tags[node.id] && <small>{tags[node.id]}</small>}
      </span>
      {node.children?.map(child => <TreeNode key={child.id} node={child} roles={roles} tags={tags} />)}
    </li>
  </ul>
}
