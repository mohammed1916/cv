import {motion,useReducedMotion} from 'framer-motion';
import {useTutorialScene} from '../../components/shared/TutorialScene';

function PairTree({step,prefix}) {
  const reduced = useReducedMotion();
  const nodes = step[`${prefix}Nodes`];
  const edges = step[`${prefix}Edges`];
  const positions = step[`${prefix}Positions`];
  const activeId = step.phase === 'start' ? nodes.find(node => !edges.some(edge => edge.toId === node.id))?.id : step[prefix === 'p' ? 'activePId' : 'activeQId'];
  const active = nodes.find(node => node.id === activeId);
  if (!active) return <div className="same-tree-tutorial__empty"><strong>{prefix}</strong><span>null</span><small>Current recursive argument is empty</small></div>;
  const shown = new Set([activeId]);
  const points = [...shown].map(id=>positions.get(id));
  const left = Math.min(...points.map(p=>p.x))-40, top = Math.min(...points.map(p=>p.y))-40;
  const width = Math.max(120,Math.max(...points.map(p=>p.x))-left+40);
  const height = Math.max(100,Math.max(...points.map(p=>p.y))-top+40);
  const box = `${left} ${top} ${width} ${height}`;
  return <section><strong>Tree {prefix} · current pair</strong>
    <motion.svg role="img" aria-label={`Tree ${prefix}, active value ${active.val}`}
      initial={reduced ? false : {viewBox:`${left-30} ${top-30} ${width+60} ${height+60}`}}
      animate={{viewBox:box}} transition={{duration:reduced ? 0 : .5}}>
      {nodes.filter(node=>shown.has(node.id)).map(node=>{const p=positions.get(node.id);return <g key={node.id} data-active={node.id===activeId} data-state={step.nodeStates?.[node.id]}>
        <circle cx={p.x} cy={p.y} r="22"/><text x={p.x} y={p.y+5} textAnchor="middle">{node.val}</text>
      </g>;})}
    </motion.svg>
    <small>{nodes.length-shown.size} other nodes outside this view · original parent/child links</small>
  </section>;
}

// One side of a transfer: the parent position, and the child position it calls or receives from.
// Null positions are drawn explicitly, because the recursion passes them as arguments.
function Chip({value, label}) {
  return <span className={`same-tree-tutorial__chip ${value === 'null' ? 'is-null' : ''}`} aria-label={label}>{value}</span>;
}

function TransferSide({prefix, step, mode}) {
  const nodes = step[`${prefix}Nodes`];
  const activeId = step[prefix === 'p' ? 'activePId' : 'activeQId'];
  const childId = step[prefix === 'p' ? 'childP' : 'childQ'];
  const valueOf = id => nodes.find(node => node.id === id)?.val ?? 'null';
  const parent = valueOf(activeId);
  const child = valueOf(childId);
  const side = step.side ?? '';
  const returned = String(step.returned);
  if (mode === 'call') {
    return <section className="same-tree-tutorial__transfer" data-mode="call">
      <strong>Tree {prefix}</strong>
      <Chip value={parent} label={`Tree ${prefix} current position ${parent}`} />
      <span className="same-tree-tutorial__arrow" aria-label={`call ${side} child`}>↓ call {side}</span>
      <Chip value={child} label={`Tree ${prefix} ${side} child ${child}`} />
    </section>;
  }
  if (mode === 'receive') {
    return <section className="same-tree-tutorial__transfer" data-mode="receive">
      <strong>Tree {prefix}</strong>
      <Chip value={child} label={`Tree ${prefix} ${side} child ${child}`} />
      <span className="same-tree-tutorial__arrow" aria-label={`${side} result returned`}>↑ returns {returned}</span>
      <Chip value={parent} label={`Tree ${prefix} current position ${parent}`} />
    </section>;
  }
  return <section className="same-tree-tutorial__transfer" data-mode="return">
    <strong>Tree {prefix}</strong>
    <Chip value={parent} label={`Tree ${prefix} current position ${parent}`} />
    <span className="same-tree-tutorial__arrow" aria-label={`returns ${returned}`}>returns {returned}</span>
  </section>;
}

export default function SameTreeTutorial({step}) {
  const scene = useTutorialScene();
  if (scene.focus.includes('result')) return <output className="same-tree-tutorial__result">{String(step.finalResult)}</output>;
  const mode = scene.focus.includes('call') ? 'call' : scene.focus.includes('receive') ? 'receive' : scene.focus.includes('return') ? 'return' : null;
  if (mode) return <div className="same-tree-tutorial same-tree-tutorial--transfer">
    <TransferSide prefix="p" step={step} mode={mode}/><span aria-hidden="true">↔</span><TransferSide prefix="q" step={step} mode={mode}/>
  </div>;
  return <div className="same-tree-tutorial"><PairTree step={step} prefix="p"/><span aria-hidden="true">↔</span><PairTree step={step} prefix="q"/></div>;
}
