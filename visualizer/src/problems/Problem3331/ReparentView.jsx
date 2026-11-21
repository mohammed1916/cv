import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import SvgViewport from '../../components/shared/SvgViewport'
import { layoutRootedTree } from '../../components/shared/treeLayout'
import { treeFromParents } from './algorithm'
import '../../components/shared/RootedTreeDiagram.css'

const GAP_X = 44
const GAP_Y = 52
const PAD = 22
const RADIUS = 15
const DURATION = 600

// The current tree is re-laid out at every step, so nodes rebalance as their parents change.
// Node positions ease from their previous spot to the new one, and each edge joins a node to its current parent.
export default function ReparentView({ root, parents, original, focus }) {
  const reduced = useReducedMotion()
  const current = layoutRootedTree(treeFromParents(parents))
  const before = layoutRootedTree(root)
  const columns = Math.max(current.columns, before.columns)
  const rows = Math.max(current.rows, before.rows)
  const width = columns * GAP_X + PAD * 2
  const height = (rows - 1) * GAP_Y + PAD * 2
  const ids = [...current.positions.keys()]
  const targets = Object.fromEntries(ids.map(id => {
    const p = current.positions.get(id)
    return [id, { x: p.x * GAP_X + PAD, y: p.depth * GAP_Y + PAD }]
  }))
  const targetKey = JSON.stringify(targets)

  const [shown, setShown] = useState(targets)
  const shownRef = useRef(shown)

  useEffect(() => {
    const from = shownRef.current
    const start = performance.now()
    const duration = reduced ? 0 : DURATION
    let frame = 0
    if (!duration) {
      shownRef.current = targets
      setShown(targets)
      return undefined
    }
    const tick = now => {
      const k = duration ? Math.min(1, (now - start) / duration) : 1
      const e = k * k * (3 - 2 * k)
      const next = {}
      for (const id of Object.keys(targets)) {
        const f = from[id] ?? targets[id]
        next[id] = { x: f.x + (targets[id].x - f.x) * e, y: f.y + (targets[id].y - f.y) * e }
      }
      shownRef.current = next
      setShown(next)
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // targetKey stands for targets; the animation restarts only when the positions change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey, reduced])

  const at = id => shown[id] ?? targets[id]
  return <section className="rooted-tree" aria-label="Current parents, animated">
    <SvgViewport width={width} height={height}>
      {ids.filter(id => id > 0).map(id => {
        const a = at(id)
        const b = at(parents[id])
        const moved = parents[id] !== original[id]
        return <line key={id} className={`reparent__edge${moved ? ' is-moved' : ''}`}
          x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
      })}
      {ids.map(id => {
        const { x, y } = at(id)
        const role = id === focus ? 'focus' : parents[id] !== original[id] ? 'new' : ''
        return <g key={id} className={`rooted-tree__node ${role ? `is-${role}` : ''}`}>
          <circle cx={x} cy={y} r={RADIUS} />
          <text x={x} y={y + 4} textAnchor="middle">{id}</text>
        </g>
      })}
    </SvgViewport>
  </section>
}
