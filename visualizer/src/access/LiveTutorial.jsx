import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TUTORIAL_STEPS } from './tutorialSteps';
import './LiveTutorial.css';

export default function LiveTutorial({ step, onStep, onClose }) {
  const lesson = TUTORIAL_STEPS[step];
  const [minimized, setMinimized] = useState(false);
  const [left, setLeft] = useState(false);
  const [bounds, setBounds] = useState(null);
  const heading = useRef(null);
  useEffect(() => {
    document.body.dataset.guidedTour = 'active';
    return () => { delete document.body.dataset.guidedTour; };
  }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    let frame;
    let previous = '';
    let scrolled = false;
    const measure = () => {
      const target = document.querySelector(lesson.target);
      if (target) {
        if (!scrolled) { target.scrollIntoView({ block: 'nearest', behavior: 'instant' }); scrolled = true; }
        const rect = target.getBoundingClientRect();
        const next = { left: Math.max(4, rect.left), top: Math.max(4, rect.top), width: Math.max(0, Math.min(innerWidth - 4, rect.right) - Math.max(4, rect.left)), height: Math.max(0, Math.min(innerHeight - 4, rect.bottom) - Math.max(4, rect.top)) };
        const signature = JSON.stringify(next);
        if (signature !== previous) { previous = signature; setBounds(next); }
      } else if (previous !== 'missing') { previous = 'missing'; setBounds(null); }
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [lesson]);
  return createPortal(<div className="live-tour" onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    {!minimized && bounds && <div className="live-tour-highlight" style={bounds} aria-hidden="true" />}
    <section className={`live-tour-card ${left ? 'is-left' : ''}`} aria-label="Guided tour" role="region">
      <header><span>LIVE WALKTHROUGH · {step + 1}/{TUTORIAL_STEPS.length}</span><button onClick={() => setMinimized(value => !value)} aria-expanded={!minimized}>{minimized ? 'Expand guide' : 'Minimize'}</button><button onClick={onClose} aria-label="End guided tour">×</button></header>
      {!minimized && <>
        <h2 ref={heading} tabIndex={-1}>{lesson.title}</h2><p>{lesson.text}</p>
        <label>Jump to a lesson<select value={step} onChange={event => onStep(Number(event.target.value))}>{TUTORIAL_STEPS.map((item, i) => <option value={i} key={item.title}>{i + 1}. {item.title}</option>)}</select></label>
        <footer><button onClick={() => setLeft(value => !value)}>Move guide {left ? 'right' : 'left'}</button><button disabled={step === 0} onClick={() => onStep(step - 1)}>Back</button><button className="live-tour-next" onClick={() => step === TUTORIAL_STEPS.length - 1 ? onClose() : onStep(step + 1)}>{step === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}</button></footer>
      </>}
    </section>
  </div>, document.body);
}
