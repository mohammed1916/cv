import { motion, useReducedMotion } from 'framer-motion'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { graphCircleLayout, graphNodeRole } from '../../components/shared/graphTraversalModel.js'
import { useTutorialScene } from '../../components/shared/TutorialScene'

const W = 420, H = 300

// Focused graph: only the causal vertices and real edges from the scene. Vertices keep their input IDs and
// positions from the full layout, so the camera is only cropped, never redrawn with renumbered vertices.
function FocusedGraph({ n, step, focus }) {
  const reduced = useReducedMotion()
  const points = graphCircleLayout(n, W, H)
  const ids = [...new Set(focus.nodes)]
  if (!ids.length) return null
  const xs = ids.map(id => points[id].x), ys = ids.map(id => points[id].y)
  const left = Math.min(...xs) - 50, top = Math.min(...ys) - 50
  const width = Math.max(140, Math.max(...xs) - left + 50), height = Math.max(120, Math.max(...ys) - top + 50)
  const state = { current: focus.current, neighbour: focus.neighbour, frontier: step.frontier, visited: step.visited, done: step.done }
  const hidden = n - ids.length
  return <>
    <motion.svg className="gtv__svg" role="img" aria-label={`Focused graph around vertex ${focus.current ?? focus.nodes[0]}`}
      initial={false} animate={{ viewBox: `${left} ${top} ${width} ${height}` }} transition={{ duration: reduced ? 0 : .4 }}
      viewBox={`${left} ${top} ${width} ${height}`}>
      {focus.edges.map(([a, b]) => {
        const active = (a === focus.current && b === focus.neighbour) || (a === focus.neighbour && b === focus.current)
        return <line key={`${a}-${b}`} className={`gtv__edge ${active ? 'is-active' : ''}`} data-edge={`${a},${b}`}
          x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} />
      })}
      {ids.map(id => <g key={id} className="gtv__node" data-node={id} data-role={graphNodeRole(id, state)}>
        <circle cx={points[id].x} cy={points[id].y} r={19} />
        <text x={points[id].x} y={points[id].y + 4} textAnchor="middle">{id}</text>
      </g>)}
    </motion.svg>
    <p className="gtv__note">{hidden} other vertices outside this view · original vertex IDs and edges</p>
  </>
}

export default function BfsVisual({ run, step }) {
  const scene = useTutorialScene()
  if (!scene) {
    return <>
      <GraphTraversalView title="Breadth-first search" n={run.input.n} edges={run.input.edges}
        current={step.current} neighbour={step.neighbour} visited={step.visited} frontier={step.frontier} done={step.done}
        frontierKind="queue" />
      {step.result !== undefined && <output aria-label="Path found">Path exists: {step.result ? 'yes' : 'no'}</output>}
    </>
  }
  const { focus } = scene
  return <section className="gtv" aria-label="Breadth-first search focus">
    {focus.kind === 'found' || focus.kind === 'not-found'
      ? <output aria-label="Path found">Path exists: {step.result ? 'yes' : 'no'}</output>
      : focus.nodes.length > 0 && <FocusedGraph n={run.input.n} step={step} focus={focus} />}
    <div className="gtv__frontier" aria-label="Queue (front first)">
      <strong>Queue (front first)</strong>
      <div className="gtv__chips">{step.frontier.length ? step.frontier.map((x, i) => <span key={i} className="gtv__chip">{x}</span>) : <em>empty</em>}</div>
    </div>
  </section>
}
