import { CONSENT_KEY, readConsent, eraseAnalyticsCookies } from './consent.js';

export const MEASUREMENT_ID = 'G-N7TMKW7YXH';
const deniedAds = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
let choice = readConsent();
let sdk, analytics, pending;
let revision = 0;
let page = { path: '/', title: 'Visualizer Pro', problem_id: undefined };
let lastPage = null;
const buildVersion = import.meta.env?.VITE_APP_VERSION || 'web-2026-11-07';
const enabledHost = () => typeof window !== 'undefined' &&
  (import.meta.env?.PROD || import.meta.env?.VITE_ANALYTICS_DEBUG === 'true');
const allowed = () => choice === 'granted' && enabledHost();
if (typeof window !== 'undefined') window[`ga-disable-${MEASUREMENT_ID}`] = !allowed();

async function initialize() {
  if (!allowed()) return false;
  if (analytics) return true;
  if (!pending) pending = (async () => {
    const api = await import('firebase/analytics');
    if (!await api.isSupported() || !allowed()) return false;
    const { firebaseApp } = await import('../access/firebase.js');
    if (!allowed()) return false;
    sdk = api;
    sdk.setConsent({ ...deniedAds, analytics_storage: 'granted' });
    analytics = sdk.initializeAnalytics(firebaseApp, { config: {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 15552000,
      page_location: location.origin + page.path,
      page_title: page.title,
      page_referrer: safeReferrer(),
    } });
    sdk.setAnalyticsCollectionEnabled(analytics, true);
    return true;
  })().catch(() => false).finally(() => { pending = null; });
  return pending;
}
function safeReferrer() {
  try { return document.referrer ? new URL(document.referrer).origin : ''; } catch { return ''; }
}
// Only explicit fields from explicit events are accepted. Never log user input,
// code, chat, error messages, account identifiers, arbitrary URLs or DOM text.
const fields = {
  visualization_start: [], visualization_complete: [], visualization_reset: [],
  playground_run: ['language'], login: ['method'],
  panel_toggle: ['panel_type', 'visible'], app_error: ['error_type'],
  begin_checkout: ['currency', 'value', 'plan'],
  purchase: ['currency', 'value', 'plan', 'transaction_id'],
};
export function sanitizeEvent(name, values = {}) {
  if (!Object.hasOwn(fields, name)) return null;
  const result = {};
  for (const key of fields[name]) {
    const value = values[key];
    if (key === 'value' && Number.isFinite(value) && value >= 0) result[key] = value;
    else if (key === 'visible' && typeof value === 'boolean') result[key] = value;
    else if (key === 'language' && ['python', 'javascript'].includes(value)) result[key] = value;
    else if (key === 'method' && value === 'google') result[key] = value;
    else if (key === 'currency' && value === 'INR') result[key] = value;
    else if (key === 'plan' && ['monthly', 'annual'].includes(value)) result[key] = value;
    else if (key === 'panel_type' && ['visual', 'code', 'reasoning', 'story', 'other'].includes(value)) result[key] = value;
    else if (key === 'error_type' && ['render', 'runtime'].includes(value)) result[key] = value;
    else if (key === 'transaction_id' && typeof value === 'string' && /^pay_[a-zA-Z0-9]{1,64}$/.test(value)) result[key] = value;
  }
  if (name === 'purchase' && (!result.transaction_id || result.value === undefined || !result.currency)) return null;
  if (['purchase', 'begin_checkout'].includes(name) && result.plan && result.value !== undefined)
    result.items = [{ item_id: result.plan, item_name: 'Visualizer Pro', price: result.value, quantity: 1 }];
  return result;
}
export async function trackEvent(name, values) {
  const clean = sanitizeEvent(name, values);
  if (!clean || !allowed()) return;
  const version = revision;
  const context = { ...page };
  if (!await initialize() || !allowed() || version !== revision) return;
  sdk.logEvent(analytics, name, { ...clean, page_location: location.origin + context.path,
    page_title: context.title, problem_id: context.problem_id, site_version: buildVersion,
    ...(import.meta.env?.VITE_ANALYTICS_DEBUG === 'true' ? { debug_mode: true } : {}) });
}
export async function trackPage(next) {
  page = next;
  if (!allowed()) return;
  const version = revision;
  if (!await initialize() || !allowed() || version !== revision || page !== next || lastPage === next.path) return;
  const previous = lastPage;
  lastPage = next.path;
  sdk.setDefaultEventParameters({ page_location: location.origin + next.path, page_title: next.title, site_version: buildVersion });
  sdk.logEvent(analytics, 'page_view', { page_location: location.origin + next.path,
    page_title: next.title, page_referrer: previous ? location.origin + previous : safeReferrer(),
    problem_id: next.problem_id, site_version: buildVersion,
    ...(import.meta.env?.VITE_ANALYTICS_DEBUG === 'true' ? { debug_mode: true } : {}) });
}
export function getConsentChoice() { return choice; }
export function setConsentChoice(next, persist = true) {
  choice = ['granted', 'denied'].includes(next) ? next : null;
  revision++;
  if (persist) try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, choice, savedAt: Date.now() })); } catch { /* Session-only choice if storage is blocked. */ }
  window[`ga-disable-${MEASUREMENT_ID}`] = !allowed();
  if (sdk && analytics) {
    sdk.setAnalyticsCollectionEnabled(analytics, allowed());
    sdk.setConsent({ ...deniedAds, analytics_storage: allowed() ? 'granted' : 'denied' });
  }
  lastPage = null;
  if (!allowed()) eraseAnalyticsCookies();
  else void trackPage(page);
  window.dispatchEvent(new Event('cpviz-consent-changed'));
}
export function openPrivacyPreferences() { window.dispatchEvent(new Event('cpviz-open-privacy')); }
