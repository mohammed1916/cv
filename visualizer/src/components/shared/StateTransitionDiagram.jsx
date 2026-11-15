// A small state machine: labelled nodes, arrows between them, and self-loops.
// nodes: [{ id, label, sub, x, y }]; edges: [{ from, to, label, active }]. Coordinates are in a 0..width / 0..height box.
import './StateTransitionDiagram.css'

const R = 34

export default function StateTransitionDiagram({ nodes = [], edges = [], width = 420, height = 220, title = 'State transitions' }) {
  const at = id => nodes.find(node => node.id === id)
  return <figure className="state-transition" aria-label={title}>
    <figcaption>{title}</figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <defs>
        <marker id="state-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" />
        </marker>
        <marker id="state-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="state-transition__arrow-active" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const a = at(edge.from), b = at(edge.to)
        if (!a || !b) return null
        const cls = `state-transition__edge${edge.active ? ' is-active' : ''}`
        if (edge.from === edge.to) {
          // Self-loop above the node.
          const x = a.x, y = a.y - R
          return <g key={i} className={cls}>
            <path d={`M ${x - 14} ${y + 2} C ${x - 44} ${y - 62}, ${x + 44} ${y - 62}, ${x + 14} ${y + 2}`} markerEnd={edge.active ? 'url(#state-arrow-active)' : 'url(#state-arrow)'} />
            <text x={x} y={y - 46} textAnchor="middle">{edge.label}</text>
          </g>
        }
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1
        const ux = dx / len, uy = dy / len
        // Parallel arrows between the same two nodes are bent apart so both directions show.
        const bend = edge.bend ?? 0
        const px = -uy * bend, py = ux * bend
        const x1 = a.x + ux * R + px, y1 = a.y + uy * R + py
        const x2 = b.x - ux * R + px, y2 = b.y - uy * R + py
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
        return <g key={i} className={cls}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={edge.active ? 'url(#state-arrow-active)' : 'url(#state-arrow)'} />
          {/* Label sits on the side the arrow is bent towards, so it never touches the line. */}
          <text x={mx - uy * Math.sign(bend) * 34} y={my + ux * Math.sign(bend) * 34 + 4} textAnchor="middle">{edge.label}</text>
        </g>
      })}
      {nodes.map(node => <g key={node.id} className={`state-transition__node${node.active ? ' is-active' : ''}`} data-state={node.id}>
        <circle cx={node.x} cy={node.y} r={R} />
        <text x={node.x} y={node.y - 2} textAnchor="middle" className="state-transition__label">{node.label}</text>
        {node.sub && <text x={node.x} y={node.y + 14} textAnchor="middle" className="state-transition__sub">{node.sub}</text>}
      </g>)}
    </svg>
  </figure>
}
