import { useState } from 'react';
import './marketing.css';

export default function WelcomeHero({ onTutorial, onPlayground, onStart }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('cpviz.welcome.v1') === 'dismissed'; } catch { return false; }
  });
  const [paused, setPaused] = useState(false);
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
      <svg viewBox="0 0 520 280" role="img" aria-label="Two Sum with target 9. Store 2 and need 7. Then 7 arrives, needs 2, finds 2 already seen, and returns 2 + 7 = 9.">
        <defs><pattern id="hero-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" opacity=".08" /></pattern></defs>
        <rect width="520" height="280" fill="url(#hero-grid)" />
        <text x="24" y="34" className="hero-target">target = 9</text>
        <rect className="hero-cursor hero-anim" x="42" y="57" width="100" height="100" rx="18" />
        <path className="hero-flow hero-anim" d="M92 149 V200 Q92 220 114 220 H182 Q204 220 204 200 V149" fill="none" strokeWidth="2" strokeDasharray="6 7" />
        {[2, 7, 11, 15].map((n, i) => <g key={n} className={`hero-node ${i > 1 ? 'hero-idle' : ''}`}>
          <rect x={50 + i * 112} y="65" width="84" height="84" rx="14" />
          {i < 2 && <rect className="hero-found hero-anim" x={50 + i * 112} y="65" width="84" height="84" rx="14" />}
          <text x={92 + i * 112} y="116" textAnchor="middle">{n}</text>
          <text className="hero-index" x={92 + i * 112} y="47" textAnchor="middle">0{i}</text>
          <text className="hero-tag" x={92 + i * 112} y="168" textAnchor="middle">{i === 0 ? 'stored' : i === 1 ? 'arrives' : 'not reached'}</text>
        </g>)}
        <text className="hero-cap hero-cap-a hero-anim" x="24" y="258">store 2 · need 9 − 2 = 7</text>
        <text className="hero-cap hero-cap-b hero-anim" x="24" y="258">7 arrives · need 9 − 7 = 2 · 2 is stored ✓</text>
        <text className="hero-cap hero-cap-c hero-anim" x="24" y="258">found: 2 + 7 = 9 → return</text>
      </svg>
      <div className="welcome-code"><span>01</span> complement = target − current<br /><span>02</span> <strong>if</strong> complement in seen: <strong>return</strong> answer</div>
    </div>
    {!dismissed && <aside className="welcome-start"><div><strong>First time here? Start with a quick tour.</strong><p>Learn to step through code, arrange panels, and run your own examples.</p></div><button className="welcome-primary" onClick={onTutorial}>Start here →</button><button onClick={dismiss} aria-label="Dismiss first visit guide">×</button></aside>}
    <div className="welcome-features"><span>01 / <strong>Watch each step</strong></span><span>02 / <strong>Arrange your workspace</strong></span><button onClick={onPlayground}>03 / <strong>Try your own code ↗</strong></button></div>
  </section>;
}
