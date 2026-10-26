import { useState } from 'react';
import './marketing.css';
import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import TwoSumPreviewCells from '../shared/TwoSumPreviewCells';

export default function WelcomeHero({ onTutorial, onPlayground, onStart }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('cpviz.welcome.v1') === 'dismissed'; } catch { return false; }
  });
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => setPhase(value => (value + 1) % 3), 2400);
    return () => clearInterval(timer);
  }, [paused, reducedMotion]);
  const previewPhase = reducedMotion ? 2 : phase;
  function dismiss() { setDismissed(true); try { localStorage.setItem('cpviz.welcome.v1', 'dismissed'); } catch { /* Optional preference */ } }
  return <section className="welcome-hero" aria-labelledby="welcome-title">
    <div className="welcome-copy">
      <span className="welcome-eyebrow">TEEM TREAT / LEARN BY SEEING</span>
      <h1 id="welcome-title">Make algorithms<br /><em>click.</em></h1>
      <p>See the code. Follow the data. Build the intuition.<br />Explore problems step by step in a workspace that moves with you.</p>
      <div className="welcome-actions"><button className="welcome-primary" onClick={onStart}>Explore Two Sum <span>↗</span></button><button onClick={onTutorial}>▶ Take the guided tour</button></div>
      <div className="welcome-meta">Free Basics &amp; Easy problems <span>·</span> Python &amp; JavaScript playground</div>
    </div>
    <div className={`welcome-visual ${paused ? 'is-paused' : ''}`}>
      <div className="welcome-demo-head"><span><i /> TWO SUM / EXECUTION PREVIEW</span><button onClick={() => setPaused(!paused)} aria-label={paused ? 'Play preview animation' : 'Pause preview animation'}>{paused ? 'Play' : 'Pause'}</button></div>
      <svg viewBox="0 0 520 280" role="img" aria-label="Two Sum: store 2 at index 0. At index 1, value 7 needs complement 2. Return indices 0 and 1.">
        <defs><pattern id="hero-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" opacity=".08" /></pattern></defs>
        <rect width="520" height="280" fill="url(#hero-grid)" />
        <text x="50" y="33" className="hero-index" fill="currentColor" fontSize="12">nums = [2, 7, 11, 15] · target = 9</text>
        <TwoSumPreviewCells x={50} y={76} spacing={112} size={64} activeIndex={previewPhase === 0 ? 0 : 1} found={previewPhase === 2} />
        <text x="50" y="216" className="hero-result">{previewPhase === 0 ? '9 − 2 = 7 · not seen yet' : previewPhase === 1 ? '9 − 7 = 2 · seen at index 0' : '2 + 7 = 9 → return [0, 1]'}</text>
        <text x="50" y="248" fill="currentColor" fontSize="13">{previewPhase === 0 ? 'Store 2 → index 0, then continue.' : previewPhase === 1 ? 'The hash map remembers 2 → index 0.' : 'match = earlier index · i = current index'}</text>
      </svg>
      <div className="welcome-code"><span>01</span> complement = target − current<br /><span>02</span> <strong>if</strong> complement in seen: <strong>return</strong> answer</div>
    </div>
    {!dismissed && <aside className="welcome-start"><div><strong>First time here? Start with a quick tour.</strong><p>Learn to step through code, arrange panels, and run your own examples.</p></div><button className="welcome-primary" onClick={onTutorial}>Start here →</button><button onClick={dismiss} aria-label="Dismiss first visit guide">×</button></aside>}
    <div className="welcome-features"><span>01 / <strong>Watch each step</strong></span><span>02 / <strong>Arrange your workspace</strong></span><button onClick={onPlayground}>03 / <strong>Try your own code ↗</strong></button></div>
  </section>;
}
