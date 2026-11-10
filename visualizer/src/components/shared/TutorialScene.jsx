import { createContext, useContext } from 'react';
import './TutorialScene.css';
export const TutorialContext = createContext(null);
export const useTutorialScene = () => useContext(TutorialContext);
export default function TutorialScene({ scene, mode, children }) {
  return <TutorialContext.Provider value={scene}>
    <section className="tutorial-scene" aria-label="Focused algorithm tutorial">
      <header className="tutorial-scene__story" aria-live="polite">
        <small>{mode === 'why' ? 'REASON → CHOICE → ACTION' : 'STEP BY STEP'}</small>
        <h3>{scene.title}</h3>
        {mode === 'why' && <p className="tutorial-scene__reason">{scene.reason}</p>}
        <p>{scene.action}</p>
        {scene.code && <code className="tutorial-scene__code">{scene.code}</code>}
        <dl>{Object.entries(scene.variables).map(([name,value]) => <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}</dl>
      </header>
      {children}
      <small className="tutorial-scene__note">Focused view of the current frame · hidden structures keep their state. Turn tutorial off to inspect everything.</small>
    </section>
  </TutorialContext.Provider>;
}
