// Minor units per currency (cents for USD, paise for INR). Keep in step with src/access/policy.js.
// Lifetime uses 36500 days so the existing expiry logic applies unchanged.
export const PRICES = {
  USD: { monthly: 214, annual: 1613, lifetime: 5378 },
  INR: { monthly: 19900, annual: 149900, lifetime: 499900 },
};
export const CURRENCIES = Object.keys(PRICES);
export const PLANS = {
  monthly: { days: 30 },
  annual: { days: 365 },
  lifetime: { days: 36500 },
};
export function priceFor(plan, currency) {
  return Object.hasOwn(PRICES, currency || '') && Object.hasOwn(PRICES[currency], plan) ? PRICES[currency][plan] : null;
}
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
// Refunds: a paid order can be refunded in full within 7 days of payment.
export const REFUND_WINDOW_MS = 7 * 86400000;
export function refundable(order = {}, now = Date.now()) {
  return order.status === 'paid' && Boolean(order.paymentId) && Number(order.paidAt || 0) > now - REFUND_WINDOW_MS;
}
