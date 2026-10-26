import SvgViewport from './SvgViewport'
import { layoutTree } from './treeLayout'
import './BinaryTreeLane.css'

/**
 * Binary tree drawn as an SVG. Pass `root` as { id, value, left, right } with
 * stable ids; `roles` maps an id to 'active' | 'visited' | 'match' | 'pruned'.
 * `tags` maps an id to short labels such as 'max', 'left', or 'depth 3'.
 */
export default function BinaryTreeLane({ title = 'Binary tree', root = null, roles = {}, tags = {}, note }) {
  const layout = layoutTree(root)
  const r = layout.radius
  return <section className="binary-tree-lane" aria-label={title}>
    <header><strong>{title}</strong>{note && <span>{note}</span>}</header>
    {!root ? <em>empty tree</em> : <SvgViewport width={layout.width} height={layout.height}>
      {layout.edges.map(edge => {
        const from = layout.positions.get(edge.from), to = layout.positions.get(edge.to)
        return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="binary-tree-lane__edge" />
      })}
      {[...layout.positions.entries()].map(([id, pos]) => {
        const role = roles[id] || ''
        return <g key={id} className={`binary-tree-lane__node ${role ? 'is-' + role : ''}`} data-role={role || undefined}>
          <circle cx={pos.x} cy={pos.y} r={r} />
          <text x={pos.x} y={pos.y + 4} textAnchor="middle">{String(pos.node.value)}</text>
          {tags[id] && <text x={pos.x} y={pos.y - r - 4} textAnchor="middle" className="binary-tree-lane__tag">{tags[id]}</text>}
        </g>
      })}
    </SvgViewport>}
  </section>
}
