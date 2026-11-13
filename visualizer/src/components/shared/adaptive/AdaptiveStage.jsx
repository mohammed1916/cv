import {motion,useReducedMotion} from 'framer-motion';
import {useLayoutEffect, useRef, useState} from 'react';
import {planTransfer,planVisuals} from './planner.js';
import './adaptive.css';

export function TrackedValues({data,previousData={},focusKeys=[],changedKeys=[],reads=[],focused=false,format=String}) {
  const reduced=useReducedMotion();
  const keys = focused ? [...new Set([...Object.keys(data),...Object.keys(previousData)])] : Object.keys(data);
  return <div className="adaptive-values">{keys.map(key=>{
    const removed=!Object.hasOwn(data,key);
    const visible=!focused || !focusKeys.length || focusKeys.includes(key);
    return <motion.div layout={!reduced} key={key} hidden={!visible} data-adaptive-item={key} data-read={focused && reads.includes(key)} data-changed={focused && changedKeys.includes(key)} data-removed={removed}>
      <small>{key}</small><strong>{removed ? 'removed' : format(data[key])}</strong>
      {focused && changedKeys.includes(key) && Object.hasOwn(previousData,key) && <small>was {format(previousData[key])}</small>}
    </motion.div>;
  })}</div>;
}

function TransferOverlay({transfer, root, reduced}) {
  const [points,setPoints]=useState(null);
  useLayoutEffect(()=>{
    if (!transfer || !root.current) { setPoints(null); return; }
    let raf;
    const measure=()=>{
      const container=root.current;
      if (!container) return;
      const region=id=>[...container.querySelectorAll('[data-visual-id]')].find(node=>node.dataset.visualId===id);
      const item=id=>[...region(id)?.querySelectorAll('[data-adaptive-item]') || []].find(node=>node.dataset.adaptiveItem===transfer.item);
      const from=item(transfer.from),to=item(transfer.to);
      if (!from || !to) { setPoints(null); return; }
      const base=container.getBoundingClientRect(),a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
      if (!a.width || !b.width) { setPoints(null); return; }
      const center=rect=>({x:rect.left+rect.width/2,y:rect.top+rect.height/2});
      const aCenter=center(a),bCenter=center(b);
      const edge=(rect,from,to)=>{
        const dx=to.x-from.x,dy=to.y-from.y;
        const scale=Math.min(dx ? rect.width/2/Math.abs(dx) : Infinity,dy ? rect.height/2/Math.abs(dy) : Infinity,1);
        return {x:from.x+dx*scale-base.left,y:from.y+dy*scale-base.top};
      };
      const start=edge(a,aCenter,bCenter),end=edge(b,bCenter,aCenter);
      const next={x1:start.x,y1:start.y,x2:end.x,y2:end.y};
      setPoints(old=>old && Object.keys(next).every(key=>Math.abs(old[key]-next[key])<1) ? old : next);
    };
    // Graph cameras and shared layouts can move anchors without resizing.
    // Follow the actual endpoints while those transitions settle.
    const started=performance.now();
    const follow=()=>{
      measure();
      if (!reduced && performance.now()-started < 650) raf=requestAnimationFrame(follow);
    };
    raf=requestAnimationFrame(follow);
    const observer=new ResizeObserver(measure);
    observer.observe(root.current);
    window.addEventListener('resize',measure);
    return ()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('resize',measure);};
  },[root,reduced,transfer?.from,transfer?.to,transfer?.item,transfer?.operation]);
  if (!transfer || !points) return null;
  return <svg className="adaptive-transfer" aria-label={`Item ${transfer.item} moves from ${transfer.from} to ${transfer.to}`} role="img">
    <defs><marker id="adaptive-transfer-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor" /></marker></defs>
    <line x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2} markerEnd="url(#adaptive-transfer-arrow)" />
    {!reduced && <motion.circle key={`${transfer.operation}:${transfer.item}`} r="5"
      initial={{cx:points.x1,cy:points.y1,opacity:1}} animate={{cx:points.x2,cy:points.y2,opacity:0}} transition={{duration:.8,ease:'easeInOut'}} />}
  </svg>;
}

export default function AdaptiveStage({visuals,run,step,previousStep,mode,beat,definition}) {
  const reduced=useReducedMotion();
  const root=useRef(null);
  const focused=mode!=='off';
  // A reason introduces an operation before its effect is applied to the presentation.
  const shownStep=focused && beat?.kind==='reason' && previousStep ? previousStep : step;
  const plans=planVisuals(visuals,{run,step,previousStep});
  const transfer=focused && beat?.kind!=='reason' ? planTransfer(visuals,{run,step,previousStep},plans) : null;
  const line=definition.code.find(line=>line.line===step.activeLine);
  return <section ref={root} className="adaptive-stage" data-mode={mode}>
    <header className="adaptive-caption" hidden={!focused} aria-live="polite">
      <small>{definition.phases.find(phase=>phase.id===step.phase)?.label || step.phase} · L{step.activeLine}</small>
      {beat?.kind==='reason' && <p className="adaptive-reason">{beat.lesson.reason}</p>}
      <code>{line?.text}</code>
      {beat?.kind!=='reason' && <p>{step.message}</p>}
    </header>
    <div className="adaptive-regions">{visuals.map((visual,index)=>{
      const plan=plans[index];
      const visible=!focused || plan.visible;
      const data=shownStep===step ? plan.data : visual.select({run,step:shownStep,previousStep});
      const props={...plan,data,changedKeys:beat?.kind==='reason' ? [] : plan.changedKeys,focused,run,step:shownStep,previousStep};
      return <motion.section key={visual.id} layout={!reduced} className="adaptive-region" data-visual-id={visual.id}
        aria-hidden={!visible} inert={!visible} initial={false}
        animate={{opacity:visible?1:0,height:visible?'auto':0,marginBottom:visible?16:0}}
        transition={{duration:reduced?0:.32}} style={{overflow:'hidden',pointerEvents:visible?'auto':'none'}}>
        <h3>{visual.title || visual.id}</h3>
        {visual.render ? visual.render(props) : <TrackedValues {...props} />}
      </motion.section>;
    })}</div>
    <TransferOverlay transfer={transfer} root={root} reduced={reduced} />
  </section>;
}
