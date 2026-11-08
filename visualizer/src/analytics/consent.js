export const CONSENT_KEY = 'cpviz.analytics-consent.v1';
export const CONSENT_TTL = 180 * 24 * 60 * 60 * 1000;
export function parseConsent(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    return value?.version === 1 && ['granted', 'denied'].includes(value.choice)
      && Number.isFinite(value.savedAt) && value.savedAt <= now && now - value.savedAt < CONSENT_TTL ? value.choice : null;
  } catch { return null; }
}
export function readConsent() {
  try { return parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { return null; }
}
export function eraseAnalyticsCookies() {
  const host = location.hostname.split('.');
  const domains = ['', ...host.map((_, i) => `; domain=${host.slice(i).join('.')}`)];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;
  }
}
