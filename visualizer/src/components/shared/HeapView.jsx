import IndexedSequence from './IndexedSequence'
import SvgViewport from './SvgViewport'
import { HEAP_TREE_LIMIT, describeHeapOps, heapHighlights, heapLayout } from './heapModel.js'
import './HeapView.css'

const GAP_X = 52, GAP_Y = 54, PAD = 26, RADIUS = 19
const MAX_LINES = 6

/**
 * A binary heap as a tree and as its array, with each push/pop and its sift-up/sift-down in words.
 * `items` are the formatted heap cells in array order; `ops` come from TracedHeap.
 */
export default function HeapView({ items, ops = [], order = 'min', title = 'Heap' }) {
  const roles = heapHighlights(ops)
  const shown = ops.slice(-MAX_LINES)
  const lines = describeHeapOps(shown, order)
  const nodes = heapLayout(items.length)
  const showTree = items.length > 0 && items.length <= HEAP_TREE_LIMIT
  const levels = nodes.length ? nodes[nodes.length - 1].depth + 1 : 1
  const width = 2 ** (levels - 1) * GAP_X + PAD * 2
  const height = (levels - 1) * GAP_Y + PAD * 2
  const at = n => ({ x: n.x * GAP_X + PAD, y: n.depth * GAP_Y + PAD })
  const rule = order === 'max' ? 'max-heap: every parent is at least as large as its children'
    : order === 'min' ? 'min-heap: every parent is at most as large as its children'
      : 'every parent comes before its children; the root is the next item out'
  return <section className="heap-view" aria-label={title}>
    <h3>{title}</h3>
    {lines.length > 0 && <ol className="heap-view__ops" aria-label="Operations this step">
      {ops.length > shown.length && <li className="heap-view__more">{ops.length - shown.length} earlier operations not listed</li>}
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ol>}
    {showTree && <div className="heap-view__tree" aria-label="Heap as a tree">
      <SvgViewport width={width} height={height}>
        {nodes.filter(n => n.parent >= 0).map(n => {
          const a = at(nodes[n.parent]), b = at(n)
          return <line key={n.index} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="heap-view__edge" />
        })}
        {nodes.map(n => {
          const { x, y } = at(n)
          const text = items[n.index]
          return <g key={n.index} className={`heap-view__node ${roles[n.index] ? `is-${roles[n.index]}` : ''} ${n.index === 0 ? 'is-root' : ''}`} data-role={roles[n.index] || undefined}>
            <circle cx={x} cy={y} r={RADIUS} />
            <text x={x} y={y + 4} textAnchor="middle">{text.length > 6 ? `${text.slice(0, 5)}…` : text}</text>
            <title>{`index ${n.index}: ${text}`}</title>
          </g>
        })}
      </SvgViewport>
    </div>}
    {items.length === 0 && <p className="heap-view__empty">The heap is empty.</p>}
    {items.length > 0 && <IndexedSequence label={`heap[] — parent of i is (i−1)/2 rounded down; children are 2i+1 and 2i+2; ${rule}`}
      length={items.length} valueAt={i => items[i]} roleAt={i => (i === 0 ? 'root' : roles[i] === 'new' ? 'new' : roles[i] === 'moved' ? 'settled' : '')} />}
    <p className="heap-view__legend">
      <span className="is-new">pushed item landed here</span>
      <span className="is-moved">item moved from the end settled here</span>
      <span className="is-path">swapped during sift</span>
      <span className="is-root">root: next out</span>
    </p>
  </section>
}
