import {motion,useReducedMotion} from 'framer-motion';
import {planVisuals} from './planner.js';
import './adaptive.css';

export function TrackedValues({data,previousData={},focusKeys=[],changedKeys=[],reads=[],focused=false,format=String}) {
  const reduced=useReducedMotion();
  return <div className="adaptive-values">{[...new Set([...Object.keys(data),...Object.keys(previousData)])].map(key=>{
    const removed=!Object.hasOwn(data,key);
    const visible=!focused || !focusKeys.length || focusKeys.includes(key);
    return <motion.div layout={!reduced} key={key} hidden={!visible} data-read={reads.includes(key)} data-changed={changedKeys.includes(key)} data-removed={removed}>
      <small>{key}</small><strong>{removed ? 'removed' : format(data[key])}</strong>
      {changedKeys.includes(key) && Object.hasOwn(previousData,key) && <small>was {format(previousData[key])}</small>}
    </motion.div>;
  })}</div>;
}

export default function AdaptiveStage({visuals,run,step,previousStep,mode,beat,definition}) {
  const reduced=useReducedMotion();
  const focused=mode!=='off';
  // A reason introduces an operation before its effect is applied to the presentation.
  const shownStep=focused && beat?.kind==='reason' && previousStep ? previousStep : step;
  const plans=planVisuals(visuals,{run,step,previousStep});
  const line=definition.code.find(line=>line.line===step.activeLine);
  return <section className="adaptive-stage" data-mode={mode}>
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
  </section>;
}
