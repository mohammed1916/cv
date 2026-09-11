import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { accessCall, backendEnabled, checkoutEnabled } from './firebase';
import { PLANS } from './policy';
import './access.css';

export function AccessDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return createPortal(<dialog className="access-dialog" ref={ref} onCancel={onClose} aria-labelledby="access-title">
    <button className="access-close" onClick={onClose} aria-label="Close">×</button>
    <h2 id="access-title">{title}</h2>{children}
  </dialog>, document.body);
}

let checkoutScript;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScript) checkoutScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => { script.remove(); checkoutScript = null; reject(new Error('Could not load checkout. Please retry.')); };
    document.head.append(script);
  });
  return checkoutScript;
}
export function Plans({ access, reason }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function purchase(plan, dialog) {
    if (!access.user) { await access.login(); return; }
    const restoreDialog = () => {
      if (dialog?.isConnected && !dialog.open) dialog.showModal();
    };
    setPending(true); setMessage('');
    try {
      await loadCheckout();
      const order = await accessCall('createProOrder', { plan });
      const checkout = new window.Razorpay({
        key: order.key, order_id: order.id, amount: order.amount, currency: 'INR',
        name: 'Teem Treat · CP Visualizer', description: `Pro · ${PLANS[plan].label}`,
        prefill: { email: access.user.email || '' },
        modal: { ondismiss: () => { setPending(false); restoreDialog(); } },
        handler: async (payment) => {
          try {
            await accessCall('verifyProPayment', payment);
            await access.refresh(); setMessage('Payment verified. Your Pro access is ready.');
          } catch { setMessage('We could not confirm access yet. Use Refresh access below; do not pay again.'); }
          finally { setPending(false); restoreDialog(); }
        },
      });
      checkout.on('payment.failed', () => { setPending(false); setMessage('Payment failed. No Pro access was activated.'); });
      // Native dialogs sit above Razorpay's body-mounted iframe and make it
      // inert. Yield the top layer until checkout completes or is dismissed.
      dialog?.close();
      checkout.open();
    } catch (err) { setMessage(err.message || 'Checkout could not start. Please retry.'); setPending(false); restoreDialog(); }
  }
  return <>
    <p>{reason || 'Learn the foundations free. Go further with Pro.'}</p>
    <div className="plan-grid">
      <section className="plan-card"><span className="access-eyebrow">FREE</span><h3>₹0</h3>
        <ul><li>All Basics and Easy visualizers</li><li>15 selected Medium problems</li><li>Beginner tutorial</li><li>30 minutes of playground every day</li></ul>
        <small>Sign in for playground access. Resets at midnight India time.</small>
      </section>
      <section className="plan-card plan-pro"><span className="access-eyebrow">TEEM TREAT PRO</span><h3>Every problem. More practice.</h3>
        <ul><li>All implemented problem visualizers unlocked</li><li>Unlimited code playground time</li><li>Future problem visualizers included during your plan</li></ul>
        {Object.entries(PLANS).map(([key, plan]) => <button className="access-primary" key={key} disabled={pending || !checkoutEnabled || access.pro} onClick={(event) => purchase(key, event.currentTarget.closest('dialog'))}>
          {access.pro ? 'Pro active' : `${plan.display} / ${plan.label}`}{key === 'annual' && !access.pro ? ' · Save ₹889 vs 12 monthly purchases' : ''}
        </button>)}
        <small>One-time payment. No automatic renewal. Catalog-only entries are coming soon. AI provider limits remain separate.</small>
        {!checkoutEnabled && <p className="access-notice">Pro purchases are coming soon. Checkout is not open yet.</p>}
      </section>
    </div>
    {!access.user && <button className="access-primary" disabled={access.busy} onClick={access.login}>Continue with Google</button>}
    {access.user && <button onClick={access.refresh}>Refresh access</button>}
    <p role="status">{message || access.error}</p>
  </>;
}

export function Tutorial({ onProblem, onPlayground, problems }) {
  const [step, setStep] = useState(0);
  const lessons = [
    ['Start with a small problem', 'Open Two Sum. For [2, 7, 11, 15] and target 9, the answer is indices [0, 1]: 2 + 7 = 9. Think about what you would need to remember while scanning the array.'],
    ['Follow the execution', 'Use the visualizer’s Play/Pause and step controls. Pause after each step and connect the highlighted code with the changing variables. Adjust speed when you want more time to read.'],
    ['Arrange your workspace', 'Drag a panel tab to another panel’s edge to split the workspace, or onto its center to group tabs. Playback can float freely: drag its title to a highlighted edge, or press Dock to mount it below the workspace. Press Float to detach it again. Drag dividers to resize; use the chevron to collapse and restore.'],
    ['Predict, then check', 'Before the next step, predict which value changes. In Two Sum, after seeing 2, remember its index; when you see 7, look for the complement 9 − 7 = 2. Try another input using the controls available in the problem.'],
    ['Try your own code', 'Open Code Playground, choose Python or JavaScript, and start with its sample. Run it, inspect the trace, then change one line and compare. Your code is saved in this browser. Free accounts get 30 minutes each day; Pro has unlimited playground time.'],
  ];
  const twoSum = problems.find(p => String(p.number) === '1' && !p.tags.includes('Codeforces'));
  return <div className="tutorial-content"><span className="access-eyebrow">QUICK START · {step + 1} / {lessons.length}</span>
    <progress value={step + 1} max={lessons.length} aria-label="Tutorial progress" />
    <div className="workspace-demo" aria-label="Example workspace: visualization on the left, code on the right, playback docked below"><div>Array &amp; Target</div><div>Code trace</div><div className="demo-playback">↔ Playback · drag to dock</div></div>
    <h3>{lessons[step][0]}</h3><p>{lessons[step][1]}</p>
    <div className="access-actions"><button disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button>
      {step < lessons.length - 1 ? <button className="access-primary" onClick={() => setStep(step + 1)}>Next</button> : <button className="access-primary" onClick={onPlayground}>Open playground</button>}
      {twoSum && <button onClick={() => onProblem(twoSum)}>Try Two Sum · Free</button>}
    </div>
  </div>;
}

// The server reserves 30-second slices in a transaction. Reservations survive
// reloads and cannot be replayed by another tab or account. Never trust localStorage.
export function PlaygroundGate({ access, onPlans, children }) {
  const [lease, setLease] = useState(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [retry, setRetry] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (!access.user || !backendEnabled) return;
    let stopped = false, busy = false, nextAttempt = 0;
    let currentLease = null;
    async function tick() {
      setNow(Date.now());
      if (document.hidden || busy || Date.now() < nextAttempt || (currentLease && currentLease.validUntil > Date.now() + 4000)) return;
      busy = true;
      try {
        const next = await accessCall('playgroundLease', { sessionId });
        currentLease = { ...next, validUntil: Date.now() + Math.max(0, next.validUntil - next.serverNow) };
        if (!stopped) { setLease(currentLease); setError(''); }
        if (!next.validUntil) nextAttempt = Date.now() + 30000;
      } catch { nextAttempt = Date.now() + 30000; if (!stopped) setError('Could not verify playground time. Check your connection and retry.'); }
      finally { busy = false; }
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => { stopped = true; clearInterval(timer); };
  }, [access.user, retry, sessionId]);
  const allowed = lease && lease.validUntil > now;
  if (!access.ready) return <div className="access-gate">Checking sign-in…</div>;
  if (!access.user) return <div className="access-gate"><h2>Your daily coding practice</h2><p>Sign in with Google for 30 minutes of free playground use every day.</p><button className="access-primary" onClick={access.login} disabled={access.busy}>Continue with Google</button><p role="alert">{access.error}</p></div>;
  if (!backendEnabled) return <div className="access-gate"><h2>Playground account access is being set up</h2><p>Daily usage tracking is not available yet. Free problem visualizers and the tutorial are available now.</p></div>;
  return <div className="playground-access-wrap">
    {allowed && <div className="playground-allowance" role="status">{lease.pro ? 'Pro · Unlimited playground' : `${Math.ceil((lease.remainingSeconds + Math.max(0, (lease.validUntil - now) / 1000)) / 60)} min left today · Resets midnight IST`}{!lease.pro && <button onClick={onPlans}>Get Pro</button>}</div>}
    {/* Keep the editor mounted after expiry so code can be recovered after renewal. */}
    {lease && <div className="playground-access-body" inert={!allowed ? true : undefined} style={!allowed ? { visibility: 'hidden' } : undefined}>{children}</div>}
    {!allowed && <div className="access-gate"><h2>{lease?.remainingSeconds === 0 ? 'You’ve used today’s 30 free minutes' : 'Checking playground access'}</h2>
      <p>{error || (lease?.remainingSeconds === 0 ? 'Come back after midnight India time, or unlock unlimited practice with Pro. Your code is saved in this browser.' : lease?.inUse ? 'Playground is open in another tab or device. Close it and retry in 30 seconds.' : 'Connecting to your account…')}</p>
      <button className="access-primary" onClick={onPlans}>See Pro plans</button><button onClick={() => { setError(''); setRetry(retry + 1); }}>Retry</button></div>}
  </div>;
}
