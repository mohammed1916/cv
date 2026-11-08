import { useEffect, useState } from 'react';
import { CONSENT_KEY, readConsent, CONSENT_TTL } from './consent.js';
import { getConsentChoice, setConsentChoice } from './client.js';
import './privacy.css';
export default function PrivacyPreferences() {
  const [choice, setChoice] = useState(getConsentChoice);
  const [open, setOpen] = useState(() => new URLSearchParams(location.search).get('privacy') === 'settings');
  useEffect(() => {
    const update = () => setChoice(getConsentChoice());
    const show = () => setOpen(true);
    const sync = event => { if (event.key === CONSENT_KEY || event.key === null) setConsentChoice(readConsent(), false); };
    const expiry = setInterval(() => {
      try { if (localStorage.getItem(CONSENT_KEY) && readConsent() === null && getConsentChoice() !== null) setConsentChoice(null, false); } catch { /* Keep this tab's choice when storage is unavailable. */ }
    }, Math.min(CONSENT_TTL, 60000));
    window.addEventListener('cpviz-consent-changed', update);
    window.addEventListener('cpviz-open-privacy', show);
    window.addEventListener('storage', sync);
    return () => { clearInterval(expiry); window.removeEventListener('cpviz-consent-changed', update); window.removeEventListener('cpviz-open-privacy', show); window.removeEventListener('storage', sync); };
  }, []);
  if (choice !== null && !open) return null;
  const choose = value => { setConsentChoice(value); setOpen(false); };
  return <aside className="privacy-notice" aria-label="Analytics preferences">
    <div><strong>Optional analytics</strong><p>Help improve the visualizer with usage statistics. No code or chat content is sent. <a href="/privacy.html">Privacy policy</a></p>{open && <small>Analytics is {choice === 'granted' ? 'on' : 'off'}. Essential storage stays enabled.</small>}</div>
    <div className="privacy-notice-actions"><button onClick={() => choose('denied')}>No thanks</button><button onClick={() => choose('granted')}>Allow analytics</button>{open && choice !== null && <button aria-label="Close analytics preferences" onClick={() => setOpen(false)}>×</button>}</div>
  </aside>;
}
