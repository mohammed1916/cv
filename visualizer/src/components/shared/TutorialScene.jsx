import { createContext, useContext, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
        {lines.map(line => <div key={line.line} className="tutorial-code__line"
          data-active={line.line === step.activeLine} aria-current={line.line === step.activeLine ? 'step' : undefined}>
          <span>{line.line === step.activeLine ? '▶' : ''} {line.line}</span><code>{line.text}</code>
        </div>)}
      </motion.div>
    </motion.div>
    <small>Trace-linked solution code · highlighted line explains the current visual state.</small>
  </section>;
}
export default function TutorialScene({ scene, mode, children, definition, step, previousStep }) {
  return <TutorialContext.Provider value={scene}>
    <section className="tutorial-scene" aria-label="Focused algorithm tutorial">
      <header className="tutorial-scene__story" aria-live="polite">
        <small>{mode === 'why' ? 'REASON → CHOICE → ACTION' : 'STEP BY STEP'}</small>
        <h3>{scene.title}</h3>
        {mode === 'why' && <p className="tutorial-scene__reason">{scene.reason}</p>}
        <p>{scene.action}</p>
        {definition && step ? <TutorialCode definition={definition} step={step} previousStep={previousStep} />
          : scene.code && <code className="tutorial-scene__code">{scene.code}</code>}
        <dl>{Object.entries(scene.variables).map(([name,value]) => <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}</dl>
      </header>
      {children}
      <small className="tutorial-scene__note">Focused view of the current frame · hidden structures keep their state. Turn tutorial off to inspect everything.</small>
    </section>
  </TutorialContext.Provider>;
}
