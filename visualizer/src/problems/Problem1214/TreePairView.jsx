import { layoutTree } from './algorithm'
import './TreePairView.css'

const X_GAP = 44
const Y_GAP = 58
const PAD = 30

function TreeDrawing({ title, levels, run, step, which }) {
  const { nodes, edges } = layoutTree(levels)
  const width = Math.max(...nodes.map(node => node.x)) * X_GAP + PAD * 2
  const height = Math.max(...nodes.map(node => node.y)) * Y_GAP + PAD * 2
  const collected = which === 'first' ? step.first : step.second
  const pointerValue = which === 'first' ? step.first[step.i] : step.second[step.j]
  const pairValue = step.pair ? (which === 'first' ? step.pair[0] : step.pair[1]) : null
  const at = node => ({ x: PAD + node.x * X_GAP, y: PAD + node.y * Y_GAP })
  return <figure className="pair-tree">
    <figcaption>{title}</figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${nodes.length} nodes, ${collected.length} visited in order`}>
      {edges.map(([a, b]) => <line key={`${a}-${b}`} className="pair-tree__edge" x1={at(nodes[a]).x} y1={at(nodes[a]).y} x2={at(nodes[b]).x} y2={at(nodes[b]).y} />)}
      {nodes.map((node, k) => {
        const { x, y } = at(node)
        const classes = ['pair-tree__node']
        if (collected.includes(node.value)) classes.push('is-seen')
        if (step.walk === which && step.current === node.value) classes.push('is-current')
        if (pointerValue === node.value && step.i >= 0) classes.push('is-pointer')
        if (pairValue === node.value) classes.push('is-pair')
        return <g key={k} className={classes.join(' ')}>
          <circle cx={x} cy={y} r="15" />
          <text x={x} y={y + 4} textAnchor="middle">{node.value}</text>
        </g>
      })}
    </svg>
  </figure>
}

function Lane({ label, values, pointer, pointerLabel }) {
  return <div className="pair-lane">
    <strong>{label}</strong>
    <ol>
      {values.map((value, index) => <li key={index} className={index === pointer ? 'is-pointer' : ''}>
        <span>{value}</span>
        {index === pointer && <em aria-label={`${pointerLabel} pointer`}>{pointerLabel}</em>}
      </li>)}
    </ol>
  </div>
}

export default function TreePairView({ run, step }) {
  const { root1, root2, target } = run.input
  const sum = step.sum
  return <div className="pair-view">
    <div className="pair-trees">
      <TreeDrawing title="Tree 1" levels={root1} run={run} step={step} which="first" />
      <TreeDrawing title="Tree 2" levels={root2} run={run} step={step} which="second" />
    </div>
    <div className="pair-lanes">
      <Lane label="First, ascending" values={step.first} pointer={step.i} pointerLabel="i" />
      <Lane label="Second, ascending" values={step.second} pointer={step.j} pointerLabel="j" />
    </div>
    <output aria-label="Pair sum">
      {sum === null ? `target = ${target}` : `${step.first[step.i]} + ${step.second[step.j]} = ${sum} against target ${target}`}
      {step.pair ? ` · pair found: ${step.pair.join(' + ')}` : ''}
    </output>
  </div>
}
