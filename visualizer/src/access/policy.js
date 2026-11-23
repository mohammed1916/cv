// While the site is in beta, Pro problems are free after sign-in; the playground remains free for everyone.
// The cloud-function access checks are skipped while this is true. Set it to
// false to require an active Pro account for the playground.
export const BETA_FREE_ACCESS = false;
// Minor units per currency (cents for USD, paise for INR). Keep in step with functions/policy.js.
export const PRICES = {
  USD: { monthly: 214, annual: 1613, lifetime: 5378 },
  INR: { monthly: 19900, annual: 149900, lifetime: 499900 },
};
export const CURRENCY_LABELS = { USD: 'USD', INR: 'INR' };
export function formatPrice(minor, currency) {
  if (currency === 'INR') return '\u20b9' + Math.round(minor / 100).toLocaleString('en-IN');
  return '$' + (minor / 100).toFixed(2).replace(/\.00$/, '');
}
const PLAN_META = {
  monthly: { label: 'month (30 days)', days: 30 },
  annual: { label: 'year (365 days)', days: 365 },
  lifetime: { label: 'one-time, lifetime', days: 36500 },
};
export function planFor(cycle, currency = 'USD') {
  const cur = PRICES[currency] ? currency : 'USD';
  const amount = PRICES[cur][cycle];
  return { ...PLAN_META[cycle], amount, currency: cur, display: formatPrice(amount, cur) };
}
// Browsers in India default to rupees; everyone else sees dollars. Visitors can switch either way.
export function defaultCurrency() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone === 'Asia/Kolkata' || String(navigator.language || '').endsWith('-IN')) return 'INR';
  } catch { /* fall through to USD */ }
  return 'USD';
}
export const PLANS = { monthly: planFor('monthly', 'USD'), annual: planFor('annual', 'USD'), lifetime: planFor('lifetime', 'USD') };
// A useful sample of the next step after Easy: arrays, windows, lists, trees,
// graphs, backtracking and dynamic programming. Basics always remain free.
export const FREE_MEDIUM = new Set(['2', '3', '11', '15', '33', '49', '53', '56', '62', '78', '98', '102', '198', '200', '238', '2333']);
// Every implemented visualizer is free. Pro unlocks the playground only.
export function isFreeProblem() {
  return true;
}
export function accessLabel(problem, pro = false) {
  if (!problem.implemented) return 'Coming soon';
  if (BETA_FREE_ACCESS) return isFreeProblem(problem) ? 'Free' : pro ? 'Beta · Unlocked' : 'Free beta · Sign in';
  return isFreeProblem(problem) ? 'Free' : pro ? 'Pro · Unlocked' : '🔒 Pro';
}

export function hasProAccess({ user, realPro = false, debugPro = false }, beta = BETA_FREE_ACCESS) {
  return beta ? Boolean(user) : Boolean(realPro || debugPro);
}
