import { trackEvent } from '../analytics/client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { accessCall, backendEnabled, checkoutEnabled } from './firebase';
import { PLANS, FREE_MEDIUM, BETA_FREE_ACCESS } from './policy';
import './access.css';
import './PlansToggle.css';

// Amounts are stored in paise; the saving is 12 monthly payments minus one annual payment.
const YEARLY_SAVING_RUPEES = (12 * PLANS.monthly.amount - PLANS.annual.amount) / 100;
const CYCLES = {
  monthly: { period: 'per month', key: 'monthly' },
  annual: { period: 'per year', key: 'annual' },
};

export function AccessDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return createPortal(<dialog className="access-dialog" ref={ref} onCancel={onClose} aria-labelledby="access-title">
    <div className="access-dialog-head">
      <h2 id="access-title">{title}</h2>
      <button className="access-close" onClick={onClose} aria-label="Close">×</button>
    </div>
    <div className="access-dialog-body">{children}</div>
  </dialog>, document.body);
}

export function GoogleSignIn({ access }) {
  return <div className="access-signin">
    <button className="access-primary" disabled={access.busy} onClick={access.login}>Continue with Google</button>
  </div>;
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
  const [cycle, setCycle] = useState('monthly');
  const selected = PLANS[cycle];
  async function purchase(plan, dialog) {
    if (BETA_FREE_ACCESS) return;
    if (!access.user) { await access.login(); return; }
    const restoreDialog = () => {
      if (dialog?.isConnected && !dialog.open) dialog.showModal();
    };
    setPending(true); setMessage('');
    try {
      await loadCheckout();
      const order = await accessCall('createProOrder', { plan });
      trackEvent('begin_checkout', { plan, currency: 'INR', value: order.amount / 100 });
      const checkout = new window.Razorpay({
        key: order.key, order_id: order.id, amount: order.amount, currency: 'INR',
        name: 'Visualizer Pro', description: `Pro · ${PLANS[plan].label}`,
        prefill: { email: access.user.email || '' },
        modal: { ondismiss: () => { setPending(false); restoreDialog(); } },
        handler: async (payment) => {
          try {
            await accessCall('verifyProPayment', payment);
            trackEvent('purchase', { plan, currency: 'INR', value: order.amount / 100, transaction_id: payment.razorpay_payment_id });
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
    <p>{BETA_FREE_ACCESS ? 'Everything is free during beta. No account or payment required.' : reason || 'Learn the foundations free. Go further with Pro.'}</p>
    <div className="plan-grid">
      <section className="plan-card"><span className="access-eyebrow">FREE</span><h3>₹0</h3>
        <ul><li>All Basics and Easy visualizers</li><li>{FREE_MEDIUM.size} selected Medium problems</li><li>Beginner tutorial</li><li>Free visualizer practice without a daily timer</li></ul>
        <small>{BETA_FREE_ACCESS ? "Beta also includes every Pro feature below, for everyone." : "Pro includes full playground access."}</small>
      </section>
      <section className="plan-card plan-pro"><span className="access-eyebrow">VISUALIZER PRO</span><h3>Every problem. More practice.</h3>
        <div className="plans-toggle" role="group" aria-label="Billing period">
          {Object.keys(CYCLES).map((key) => <button type="button" key={key} className="plans-toggle-btn" aria-pressed={cycle === key} onClick={() => setCycle(key)}>
            {key === 'monthly' ? 'Monthly' : 'Yearly'}
          </button>)}
        </div>
        <div className="plans-price">
          <s className="plans-price-regular" aria-label="Regular reference price">{selected.regular}</s>
          {BETA_FREE_ACCESS && <s className="plans-price-regular" aria-label="Paid plan reference price">{selected.display} {CYCLES[cycle].period}</s>}
          <strong className="plans-price-amount">{BETA_FREE_ACCESS ? '₹0' : selected.display}</strong>
          {!BETA_FREE_ACCESS && <span className="plans-price-period">{CYCLES[cycle].period}</span>}
          <span className="plans-price-beta">{BETA_FREE_ACCESS ? 'Free during beta' : 'Beta price'}</span>
        </div>
        {!BETA_FREE_ACCESS && cycle === 'annual' && <p className="plans-saving">Save ₹{YEARLY_SAVING_RUPEES.toLocaleString('en-IN')} a year</p>}
        <ul><li>All implemented problem visualizers unlocked</li><li>Unlimited code playground time</li><li>New visualizers included during beta</li></ul>
        {BETA_FREE_ACCESS ? <p role="status"><strong>Beta / alpha stage: everything is unlocked.</strong> Every problem and the code playground are free for everyone until the website goes into production.</p> : <p>Try Pro free for 3 days. No card required and no automatic charge.</p>}
        {access.account?.trialActive && access.pro && <p role="status">Free trial active until {new Date(access.account.trialEndsAt).toLocaleString()}.</p>}
        {!BETA_FREE_ACCESS && (!access.user || access.account?.trialAvailable) && <button className="access-primary" disabled={pending || access.busy || !backendEnabled} onClick={access.startTrial}>
          {access.user ? 'Start 3-day free trial' : 'Sign in to start your free trial'}
        </button>}
        {access.account?.trialEndsAt && !access.pro ? <p>Your free trial has ended. Subscribe to continue with Pro, or keep using the free problem visualizers.</p> : null}
        {!BETA_FREE_ACCESS && <button className="access-primary" disabled={pending || access.busy || !checkoutEnabled || (access.pro && access.account?.paid)} onClick={(event) => purchase(cycle, event.currentTarget.closest('dialog'))}>
          {access.pro && access.account?.paid ? 'Paid Pro active' : `${selected.display} / ${selected.label}`}
        </button>}
        {!BETA_FREE_ACCESS && <small>Yearly plan: {PLANS.annual.display} for 365 days, instead of {PLANS.monthly.display} a month. If you buy during your trial, your paid time starts after the trial ends.</small>}
        <small>{BETA_FREE_ACCESS ? "No payment, trial countdown or automatic charge. Reference prices are not charged during beta." : "One-time payment. No automatic renewal."} Catalog-only entries are coming soon. AI provider limits remain separate.</small>
        {!BETA_FREE_ACCESS && !checkoutEnabled && <p className="access-notice">Pro purchases are coming soon. Checkout is not open yet.</p>}
      </section>
    </div>
    {!BETA_FREE_ACCESS && !access.user && <>
      <GoogleSignIn access={access} />
    </>}
    {!BETA_FREE_ACCESS && access.user && <button onClick={access.refresh}>Refresh access</button>}
    <p role="status">{message || access.error}</p>
  </>;
}

// Playground uses the same account-level Pro entitlement as the catalogue.
// No timers, session leases, daily quotas or per-run network checks.
export function PlaygroundGate({ access, onPlans, children }) {
  const previouslyAllowed = useRef(false);
  if (access.pro) previouslyAllowed.current = true;
  if (BETA_FREE_ACCESS) return children;
  const checking = !access.ready || (access.user && !access.accountReady && backendEnabled);
  return <div className="playground-access-wrap">
    {previouslyAllowed.current && <div className="playground-access-body" inert={!access.pro ? true : undefined} style={!access.pro ? { visibility: 'hidden' } : undefined}>{children}</div>}
    {!access.pro && <div className="access-gate">
      <h2>{checking ? 'Checking your account…' : 'Playground is included with Pro'}</h2>
      <p>{checking ? 'Loading your saved access.' : 'Your Pro account unlocks the full playground, with no daily timer or device restrictions. An active Pro trial also includes full access.'}</p>
      {!checking && !access.user && <GoogleSignIn access={access} />}
      {!checking && <button className="access-primary" onClick={onPlans}>See Pro plans</button>}
      {!checking && access.user && <button onClick={access.refresh}>Refresh access</button>}
      {access.error && <p role="alert">{access.error}</p>}
    </div>}
  </div>;
}
