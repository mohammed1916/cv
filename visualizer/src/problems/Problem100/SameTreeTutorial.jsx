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
  const children = ['left','right'].includes(step.phase) ? edges.filter(edge => edge.fromId === activeId) : [];
  const shown = new Set([activeId,...children.map(edge => edge.toId)]);
  const points = [...shown].map(id=>positions.get(id));
  const left = Math.min(...points.map(p=>p.x))-40, top = Math.min(...points.map(p=>p.y))-40;
  const width = Math.max(120,Math.max(...points.map(p=>p.x))-left+40);
  const height = Math.max(100,Math.max(...points.map(p=>p.y))-top+40);
  const box = `${left} ${top} ${width} ${height}`;
  return <section><strong>Tree {prefix} · {step.phase === 'left' ? 'next: left child' : step.phase === 'right' ? 'next: right child' : 'current pair'}</strong>
    <motion.svg role="img" aria-label={`Tree ${prefix}, active value ${active.val} ${children.length ? 'and immediate children' : ''}`}
      initial={reduced ? false : {viewBox:`${left-30} ${top-30} ${width+60} ${height+60}`}}
      animate={{viewBox:box}} transition={{duration:reduced ? 0 : .5}}>
      {children.map(edge=>{const a=positions.get(edge.fromId),b=positions.get(edge.toId);return <line key={edge.toId} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;})}
      {nodes.filter(node=>shown.has(node.id)).map(node=>{const p=positions.get(node.id);return <g key={node.id} data-active={node.id===activeId} data-state={step.nodeStates?.[node.id]}>
        <circle cx={p.x} cy={p.y} r="22"/><text x={p.x} y={p.y+5} textAnchor="middle">{node.val}</text>
      </g>;})}
    </motion.svg>
    <small>{nodes.length-shown.size} other nodes outside this view · original parent/child links</small>
  </section>;
}
export default function SameTreeTutorial({step}) {
  const scene = useTutorialScene();
  if (scene.focus.includes('result')) return <output className="same-tree-tutorial__result">{String(step.finalResult)}</output>;
  return <div className="same-tree-tutorial"><PairTree step={step} prefix="p"/><span aria-hidden="true">↔</span><PairTree step={step} prefix="q"/></div>;
}
