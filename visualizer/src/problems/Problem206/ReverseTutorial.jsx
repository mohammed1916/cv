import { motion, useReducedMotion } from 'framer-motion'
import { useTutorialScene } from '../../components/shared/TutorialScene'

const W = 420, H = 190, Y = 92, R = 24
const SLOT = { prev: 70, curr: 210, nxt: 350 }

// A pointer is a quadratic arc from the source node. Forward targets arc above, backward or None targets arc below,
// so a rewire is drawn as the same path shape moving its endpoint and flipping its bend.
function pointerPath(sx, tx) {
  const dir = tx >= sx ? 1 : -1
  const start = sx + dir * R, end = tx - dir * R
  const bend = dir > 0 ? Y - 62 : Y + 62
  return `M ${start} ${Y} Q ${(start + end) / 2} ${bend} ${end} ${Y}`
}

function NodeBox({ x, label, role }) {
  if (label === null) return <g className="rlt__none" data-role={role}>
    <rect x={x - 26} y={Y - 16} width={52} height={32} rx={6} />
    <text x={x} y={Y + 5} textAnchor="middle">None</text>
  </g>
  return <g className="rlt__node" data-role={role}>
    <circle cx={x} cy={Y} r={R} />
    <text x={x} y={Y + 5} textAnchor="middle">{label}</text>
  </g>
}

export default function ReverseTutorialVisual({ run, step }) {
  const scene = useTutorialScene()
  const reduced = useReducedMotion()
  const values = run.input.values
  const label = i => (i >= 0 ? values[i] : null)
  if (!scene) {
    const n = values.length
    if (n === 0) return <p className="rlt__note">Empty list: the result is None.</p>
    const spacing = Math.min(70, 360 / n)
    const x = i => 40 + i * spacing
    return <svg className="rlt__svg" role="img" aria-label="Linked list pointers" viewBox={`0 0 ${Math.max(W, x(n) + 40)} ${H}`}>
      {values.map((v, i) => <NodeBox key={i} x={x(i)} label={v} role={i === step.curr ? 'curr' : i === step.prev ? 'prev' : undefined} />)}
      {step.links.map((t, i) => t >= 0 ? <path key={i} className="rlt__link" d={pointerPath(x(i), x(t))} /> : null)}
      <text x={20} y={H - 12} className="rlt__note">prev {step.prev >= 0 ? values[step.prev] : 'None'} · curr {step.curr >= 0 ? values[step.curr] : 'None'} · nxt {step.nxt >= 0 ? values[step.nxt] : 'None'}</text>
    </svg>
  }
  const { focus } = scene
  const { prev, curr, nxt } = step
  const slots = [
    { key: 'prev', index: prev, x: SLOT.prev },
    { key: 'curr', index: curr, x: SLOT.curr },
    { key: 'nxt', index: nxt, x: SLOT.nxt },
  ]
  const shown = slots.filter(s => focus.nodes.includes(s.index) || s.key === 'prev' && focus.kind === 'rewire' || s.key === 'nxt' && focus.kind === 'rewire')
  const old = focus.oldLink, next = focus.newLink
  // A None target is drawn as a short backward stub beside curr, so the old and new pointers keep one path shape.
  const oldD = pointerPath(SLOT.curr, nxt >= 0 ? SLOT.nxt : SLOT.curr + 60)
  const newD = next ? pointerPath(SLOT.curr, prev >= 0 ? SLOT.prev : SLOT.curr - 60) : null
  const transfer = focus.kind === 'rewire'
  return <section className="rlt" aria-label="Pointer rewiring focus">
    <svg className="rlt__svg" role="img" aria-label={`Focused pointers: ${focus.kind}`} viewBox={`0 0 ${W} ${H}`}>
      {shown.map(s => <NodeBox key={s.key} x={s.x} label={label(s.index)} role={s.key} />)}
      {transfer && <motion.path className="rlt__link rlt__link--transfer" data-transfer="old-to-new"
        initial={{ d: oldD }} animate={{ d: newD ?? oldD }} transition={{ duration: reduced ? 0 : .5 }} />}
      {!transfer && old && <path className="rlt__link is-active" d={oldD} />}
      {!transfer && next && <path className="rlt__link is-active" d={newD} />}
    </svg>
    <dl className="rlt__vars">
      {Object.entries(scene.variables).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}
    </dl>
    <p className="rlt__note">{shown.length === 0 ? 'No node is in focus for this scene.' : `${values.length - focus.nodes.length} other nodes outside this view`}</p>
  </section>
}
