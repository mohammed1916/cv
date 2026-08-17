import { motion } from 'framer-motion'
import './AlgorithmStatePrimitives.css'

/** Reusable state views for step-driven algorithm visualizers. */
export function StackLane({ title = 'Stack', items = [], dropped = [], note }) {
  return (
    <section className="algorithm-state-lane" aria-label={title}>
      <header><strong>{title}</strong>{note && <span>{note}</span>}</header>
      <div className="algorithm-stack-cells">
        {items.length ? items.map((item, index) => <motion.b layout key={`${item}-${index}`} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{item}</motion.b>) : <em>empty</em>}
        {dropped.map((item, index) => <s key={`${item}-${index}`}>{item}</s>)}
      </div>
    </section>
  )
}

export function BitmaskLane({ title = 'Letter masks', entries = [], active = [], pair = null, overlap = false }) {
  return (
    <section className="algorithm-state-lane algorithm-bitmask-lane" aria-label={title}>
      <header><strong>{title}</strong><span>one bit per lowercase letter</span></header>
      <div className="algorithm-bitmask-list">
        {entries.map((entry, index) => {
          const selected = active.includes(index) || pair?.includes(index)
          return <motion.div layout key={`${entry.label}-${index}`} className={`algorithm-bitmask-entry ${selected ? 'active' : ''} ${pair?.includes(index) ? (overlap ? 'overlap' : 'disjoint') : ''}`}><b>{entry.label}</b><code>{entry.letters ? `{${entry.letters}}` : 'unencoded'}</code></motion.div>
        })}
      </div>
    </section>
  )
}

export function DPTable({ title = 'DP table', values = [], activeCell = null, rowLabels = [], columnLabels = [] }) {
  return (
    <section className="algorithm-state-lane" aria-label={title}>
      <header><strong>{title}</strong><span>{activeCell ? `updating [${activeCell.row}, ${activeCell.column}]` : 'state table'}</span></header>
      <div className="algorithm-dp-table" style={{ gridTemplateColumns: `auto repeat(${Math.max(values[0]?.length || 1, 1)}, minmax(38px, 1fr))` }}>
        <span />{(columnLabels.length ? columnLabels : values[0]?.map((_, index) => index) || []).map((label) => <small key={`col-${label}`}>{label}</small>)}
        {values.map((row, rowIndex) => <div className="algorithm-dp-row" key={`row-${rowIndex}`} style={{ display: 'contents' }}><small>{rowLabels[rowIndex] ?? rowIndex}</small>{row.map((value, columnIndex) => <motion.b key={`${rowIndex}-${columnIndex}`} className={activeCell?.row === rowIndex && activeCell?.column === columnIndex ? 'active' : ''} animate={activeCell?.row === rowIndex && activeCell?.column === columnIndex ? { scale: [1, 1.08, 1] } : { scale: 1 }}>{value}</motion.b>)}</div>)}
      </div>
    </section>
  )
}

export function GraphFrontierLane({ title = 'Traversal frontier', nodes = [], edges = [], activeNode, visited = [] }) {
  const position = (index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2
    return { x: 150 + Math.cos(angle) * 57, y: 86 + Math.sin(angle) * 57 }
  }
  const nodeIndex = new Map(nodes.map((node, index) => [String(node), index]))
  return (
    <section className="algorithm-state-lane" aria-label={title}>
      <header><strong>{title}</strong><span>{edges.length} edges</span></header>
      <svg className="algorithm-graph-canvas" viewBox="0 0 300 172" role="img" aria-label={`${title}: ${nodes.length} nodes`}>
        {edges.map(([from, to], index) => {
          const a = position(nodeIndex.get(String(from))); const b = position(nodeIndex.get(String(to)))
          return <line key={`${from}-${to}-${index}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        })}
        {nodes.map((node, index) => {
          const { x, y } = position(index); const isActive = String(node) === String(activeNode); const isVisited = visited.map(String).includes(String(node))
          return <g key={node} className={`${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}`}><motion.circle cx={x} cy={y} r="16" animate={isActive ? { r: [16, 19, 16] } : { r: 16 }} /><text x={x} y={y + 4} textAnchor="middle">{node}</text></g>
        })}
      </svg>
    </section>
  )
}
