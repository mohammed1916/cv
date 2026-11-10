import {motion,useReducedMotion} from 'framer-motion';
import {tutorialHeapModel} from './tutorialHeapModel.js';
export default function TutorialHeap({items,ops,title}) {
  const reduced=useReducedMotion();
  const model=tutorialHeapModel(items,ops);
  const byId=new Map(model.nodes.map(n=>[n.index,n]));
  return <section className="tutorial-heap" aria-label={title}>
    <h3>{title}</h3>
    {!items.length ? <p>Empty heap.</p> : <motion.svg initial={false} animate={{viewBox:model.viewBox}} transition={{duration:reduced?0:.4}} role="img" aria-label="Focused heap neighborhood, original array indices">
      {model.nodes.map(n=>{const p=byId.get(n.parent);return p?<line key={`e${n.index}`} x1={p.x} y1={p.y} x2={n.x} y2={n.y}/>:null;})}
      {model.nodes.map(n=><g key={n.index} data-flow-anchor={n.index === (ops.at(-1)?.end >= 0 ? ops.at(-1).end : 0) ? true : undefined} className={n.active?'is-focus':''}>
        <circle cx={n.x} cy={n.y} r="25"/><text x={n.x} y={n.y+4} textAnchor="middle">{String(items[n.index])}</text>
        <text x={n.x} y={n.y+41} textAnchor="middle">[{n.index}]{n.parent>=0&&!byId.has(n.parent)?` · parent [${n.parent}] outside view`:''}</text>
      </g>)}
    </motion.svg>}
    <p>{model.hidden} other nodes outside this view · current heap snapshot{ops.length ? ` after ${ops.at(-1).type}` : ''}. Highlighted nodes belong to the active operation.</p>
  </section>;
}
