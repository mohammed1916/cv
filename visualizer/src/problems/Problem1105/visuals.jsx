import DPDependencyView from '../../components/shared/DPDependencyView';
import {motion, useReducedMotion} from 'framer-motion';
import './adaptiveBooks.css';

function BookStrip({data, focusKeys, reads, focused}) {
  const reduced = useReducedMotion();
  return <div className="adaptive-books" aria-label="Ordered books">
    {Object.entries(data).map(([id, [width, height]]) => {
      const visible = !focused || !focusKeys.length || focusKeys.includes(id);
      return <motion.div layout={!reduced} key={id} hidden={!visible} className="adaptive-book"
        data-read={focused && reads.includes(id)} style={{'--book-height': `${44 + height * 4}px`, '--book-width': `${Math.min(76, 42 + width * 2)}px`}}>
        <strong>{id}</strong><span>{width} wide</span><span>{height} tall</span>
      </motion.div>;
    })}
  </div>;
}

export const shelfVisuals = [
  {
    id:'dp', title:'Prefix costs',
    select:({step})=>Object.fromEntries(step.snapshot.dp.map((value,i)=>[String(i),value])),
    reads:({step})=>['candidate','improve','done','prefix'].includes(step.kind)
      ? [step.snapshot.end,...(step.snapshot.start ? [step.snapshot.start-1] : [])] : [],
    render:({step,focused,focusKeys})=><DPDependencyView title="Minimum height for each prefix" shape="linear" values={step.snapshot.dp}
      target={[0,step.snapshot.end ?? 0]} sources={step.snapshot.start ? [{cell:[0,step.snapshot.start-1],chosen:step.kind==='improve'}] : []}
      focusCells={focused && focusKeys.length ? focusKeys.map(key=>[0,Number(key)]) : null}
      recurrence="dp[end] = min(dp[end], dp[start-1] + tallest)" />,
  },
  {
    id:'books',title:'Books in their original order',
    select:({run})=>Object.fromEntries(run.input.books.map((book,i)=>[String(i+1),book])),
    reads:({step})=>step.snapshot.start ? Array.from({length:step.snapshot.end-step.snapshot.start+1},(_,i)=>step.snapshot.start+i) : [],
    render:props=><BookStrip {...props} />,
  },
  // Adding this registration is sufficient for ALL three modes. No tutorial renderer or scene edit.
  {
    id:'variables',title:'Current variables',
    select:({step})=>Object.fromEntries(['end','start','width','tallest','candidate'].filter(key=>step.snapshot[key]!==undefined).map(key=>[key,step.snapshot[key]])),
    reads:({step})=>['fit','stop'].includes(step.kind) ? ['width'] : step.kind==='candidate' ? ['tallest','candidate'] : [],
  },
];
