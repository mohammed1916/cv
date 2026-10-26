import SvgViewport from './SvgViewport'
import { layoutRootedTree } from './treeLayout'
import './RootedTreeDiagram.css'

const GAP_X = 44
const GAP_Y = 52
const PAD = 22
const RADIUS = 15

/**
 * Rooted tree of any branching factor, drawn as SVG. Nodes are { id, children }.
 * roles maps a node id to 'focus' | 'target' | 'new' | 'best' (other nodes stay neutral).
 */
export default function RootedTreeDiagram({ root, roles = {}, title = 'Tree' }) {
  const layout = layoutRootedTree(root)
  const width = layout.columns * GAP_X + PAD * 2
  const height = (layout.rows - 1) * GAP_Y + PAD * 2
  const at = id => {
    const p = layout.positions.get(id)
    return { x: p.x * GAP_X + PAD, y: p.depth * GAP_Y + PAD }
  }
  return <section className="rooted-tree" aria-label={title}>
    <SvgViewport width={width} height={height}>
      {layout.edges.map(([from, to]) => {
        const a = at(from), b = at(to)
        return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="rooted-tree__edge" />
      })}
      {[...layout.positions.keys()].map(id => {
        const { x, y } = at(id)
        const role = roles[id] || ''
        return <g key={id} className={`rooted-tree__node ${role ? `is-${role}` : ''}`} data-role={role || undefined}>
          <circle cx={x} cy={y} r={RADIUS} />
          <text x={x} y={y + 4} textAnchor="middle">{id}</text>
        </g>
      })}
    </SvgViewport>
  </section>
}
