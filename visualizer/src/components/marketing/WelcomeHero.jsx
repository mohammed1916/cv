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
      <svg viewBox="0 0 520 280" role="img" aria-label="Two Sum: two plus seven equals nine. Store two, then find its complement seven.">
        <defs><pattern id="hero-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" opacity=".08" /></pattern></defs>
        <rect width="520" height="280" fill="url(#hero-grid)" />
        <path className="hero-flow" d="M85 130 V200 Q85 220 110 220 H235 Q260 220 260 195 V130" fill="none" stroke="#9e85ff" strokeWidth="2" strokeDasharray="6 7" />
        {[2,7,11,15].map((n,i) => <g key={n} className={i < 2 ? 'hero-node hero-match' : 'hero-node'} style={{animationDelay:`${i * .4}s`}}><rect x={50+i*112} y="65" width="84" height="84" rx="14" /><text x={92+i*112} y="116" textAnchor="middle">{n}</text><text className="hero-index" x={92+i*112} y="47" textAnchor="middle">0{i}</text></g>)}
        <text x="302" y="220" className="hero-result">2 + 7 = 9</text>
      </svg>
      <div className="welcome-code"><span>01</span> complement = target − current<br /><span>02</span> <strong>if</strong> complement in seen: <strong>return</strong> answer</div>
    </div>
    {!dismissed && <aside className="welcome-start"><div><strong>First time here? Start with a quick tour.</strong><p>Learn to step through code, arrange panels, and run your own examples.</p></div><button className="welcome-primary" onClick={onTutorial}>Start here →</button><button onClick={dismiss} aria-label="Dismiss first visit guide">×</button></aside>}
    <div className="welcome-features"><span>01 / <strong>Watch each step</strong></span><span>02 / <strong>Arrange your workspace</strong></span><button onClick={onPlayground}>03 / <strong>Try your own code ↗</strong></button></div>
  </section>;
}
