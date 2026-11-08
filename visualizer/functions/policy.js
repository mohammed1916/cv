// Beta prices (₹99 a month, ₹799 a year). Keep in step with src/access/policy.js.
const MONTHLY_PAISE = 9900;
const YEARLY_PAISE = 79900;
export const PLANS = { monthly: { amount: MONTHLY_PAISE, days: 30 }, annual: { amount: YEARLY_PAISE, days: 365 } };
export const TRIAL_MS = 3 * 86400000;
export function status(data = {}, now = Date.now()) {
  const paidExpiresAt = Number(data.expiresAt || 0);
  const trialEndsAt = Number(data.trialEndsAt || 0);
  const paid = paidExpiresAt > now;
  const trialActive = !paid && trialEndsAt > now;
  return {
    pro: paid || trialActive,
    paid,
    expiresAt: Math.max(paidExpiresAt, trialEndsAt),
    paidExpiresAt,
    trialEndsAt,
    trialActive,
    trialAvailable: data.trialStartedAt == null && !paidExpiresAt && !trialEndsAt,
  };
}
export function trialStart(data = {}, now = Date.now()) {
  return status(data, now).trialAvailable ? { trialStartedAt: now, trialEndsAt: now + TRIAL_MS } : null;
}
export function entitlementEnd(current, days, now) { return Math.max(current || 0, now) + days * 86400000; }
