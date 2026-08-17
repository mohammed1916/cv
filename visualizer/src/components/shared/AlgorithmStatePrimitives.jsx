import { motion } from 'framer-motion'
import { GraphCanvas3D, circularLayout } from '../viz3d'
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

export function DPTable({ title = 'DP table', values = [], activeCell = null, relatedCells = [], rowLabels = [], columnLabels = [] }) {
  return (
    <section className="algorithm-state-lane" aria-label={title}>
      <header><strong>{title}</strong><span>{activeCell ? `updating [${activeCell.row}, ${activeCell.column}]` : 'state table'}</span></header>
      <div className="algorithm-dp-table" style={{ gridTemplateColumns: `auto repeat(${Math.max(values[0]?.length || 1, 1)}, minmax(38px, 1fr))` }}>
        <span />{(columnLabels.length ? columnLabels : values[0]?.map((_, index) => index) || []).map((label) => <small key={`col-${label}`}>{label}</small>)}
        {values.map((row, rowIndex) => <div className="algorithm-dp-row" key={`row-${rowIndex}`} style={{ display: 'contents' }}><small>{rowLabels[rowIndex] ?? rowIndex}</small>{row.map((value, columnIndex) => {
          const isActive = activeCell?.row === rowIndex && activeCell?.column === columnIndex
          const isRelated = relatedCells.some((cell) => cell.row === rowIndex && cell.column === columnIndex)
          return <motion.b key={`${rowIndex}-${columnIndex}`} className={`${isActive ? 'active' : ''} ${isRelated ? 'related' : ''}`} animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}>{value}</motion.b>
        })}</div>)}
      </div>
    </section>
  )
}

export function GraphFrontierLane({ title = 'Traversal frontier', nodes = [], edges = [], activeNode, visited = [], embedded = false }) {
  const graphNodes = circularLayout(nodes, 400, 260).map((node) => ({ ...node, label: String(node.id) }))
  const graphEdges = edges.map(([fromId, toId]) => ({ fromId: String(fromId), toId: String(toId) }))
  const canvas = <div className="algorithm-graph-host"><GraphCanvas3D nodes={graphNodes} edges={graphEdges} visitedSet={new Set(visited)} activeNode={activeNode} width={400} height={260} /></div>
  if (embedded) return <div className="algorithm-graph-embedded" aria-label={title}>{canvas}</div>
  return <section className="algorithm-state-lane" aria-label={title}><header><strong>{title}</strong><span>{edges.length} edges</span></header>{canvas}</section>
}
