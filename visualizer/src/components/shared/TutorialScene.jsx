import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './TutorialScene.css';
export const TutorialContext = createContext(null);
export const useTutorialScene = () => useContext(TutorialContext);
function TutorialCode({ definition, step, previousStep }) {
  const [overview, setOverview] = useState(false);
  const reduced = useReducedMotion();
  const lines = definition.code || [];
  const activeIndex = lines.findIndex(line => line.line === step.activeLine);
  const start = Math.max(0, Math.min(activeIndex - 2, lines.length - 5));
  const phase = frame => definition.phases.find(item => item.id === frame?.phase)?.label;
  const scale = overview ? .8 : 1;
  return <section className="tutorial-code" aria-label="Code connected to current algorithm state">
    <div className="tutorial-code__heading">
      <strong>{phase(step)} · Line {step.activeLine}</strong>
      <button type="button" aria-pressed={overview} onClick={() => setOverview(value => !value)}>
        {overview ? 'Focus active lines' : 'Zoom out · Full code'}
      </button>
    </div>
    <p className="tutorial-code__transition">
      {previousStep ? `${phase(previousStep)} · L${previousStep.activeLine} → ` : ''}
      {phase(step)} · L{step.activeLine}
    </p>
    <motion.div className="tutorial-code__viewport" initial={false}
      animate={{height: overview ? lines.length * 24 * scale : Math.min(5, lines.length) * 24}}
      transition={{duration: reduced ? 0 : .4}}>
      <motion.div initial={false} animate={{y: overview ? 0 : -start * 24, scale}}
        transition={{duration: reduced ? 0 : .4}} style={{transformOrigin:'top left'}}>
        {lines.map((line, index) => <div key={line.line} className="tutorial-code__line"
          aria-hidden={!overview && (index < start || index >= start + 5)} data-active={line.line === step.activeLine} aria-current={line.line === step.activeLine ? 'step' : undefined}>
          <span>{line.line === step.activeLine ? '▶' : ''} {line.line}</span><code>{line.text}</code>
        </div>)}
      </motion.div>
    </motion.div>
    <small>Trace-linked solution code · highlighted line explains the current visual state.</small>
  </section>;
}
export default function TutorialScene({ beat, children, definition, step }) {
  const reduced = useReducedMotion();
  const { scene, kind } = beat;
  const line = definition.code.find(item => item.line === step.activeLine);
  const phase = definition.phases.find(item => item.id === step.phase)?.label || step.phase;
  return <section className="tutorial-scene tutorial-scene--directed" aria-label="Directed algorithm tutorial">
    <div className="tutorial-scene__position">
      <span>{phase}</span><span>{kind === 'reason' ? 'Why' : kind === 'code' ? 'Code' : 'Effect'} · L{step.activeLine}</span>
    </div>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={beat.key} className="tutorial-scene__beat" data-tutorial-kind={kind}
        initial={{opacity:0, y:reduced ? 0 : 12, scale:reduced ? 1 : .985}}
        animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:reduced ? 0 : -8}}
        transition={{duration:reduced ? 0 : .22}}>
        {kind === 'reason' && <header className="tutorial-scene__story" aria-live="polite">
          <small>WHY THIS OPERATION?</small><h3>{scene.title}</h3>
          <p className="tutorial-scene__reason">{scene.reason}</p>
        </header>}
        {kind === 'code' && <header className="tutorial-scene__story">
          <small>NEXT, EXECUTE THIS CODE</small><h3>{scene.title}</h3>
          <TutorialCode definition={definition} step={step} />
        </header>}
        {kind === 'impact' && <TutorialContext.Provider value={scene}>
          <header className="tutorial-scene__story" aria-live="polite">
            <div className="tutorial-scene__cause"><span>L{step.activeLine}</span><code>{line?.text}</code><span aria-hidden="true">↓</span></div>
            <p>{scene.action}</p>
            <dl>{Object.entries(scene.variables || {}).map(([name,value]) => <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}</dl>
          </header>
          {children}
        </TutorialContext.Provider>}
      </motion.div>
    </AnimatePresence>
  </section>;
}
