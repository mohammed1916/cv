export const FREE_SECONDS = 1800;
const MONTHLY_PAISE = 1900;
export const PLANS = { monthly: { amount: MONTHLY_PAISE, days: 30 }, annual: { amount: MONTHLY_PAISE * 12, days: 365 } };
export const TRIAL_MS = 3 * 86400000;
export const indiaDay = (now) => new Date(now + 19800000).toISOString().slice(0, 10);
export const nextMidnight = (now) => Date.parse(`${indiaDay(now)}T00:00:00+05:30`) + 86400000;
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
export function reserve(data = {}, sessionId, now = Date.now()) {
  const day = indiaDay(now);
  const used = data.day === day ? Number(data.used || 0) : 0;
  if (data.day === day && data.validUntil > now) return {
    record: null,
    response: { validUntil: data.sessionId === sessionId ? data.validUntil : 0, remainingSeconds: Math.max(0, FREE_SECONDS - used), inUse: data.sessionId !== sessionId, serverNow: now },
  };
  const seconds = Math.min(30, FREE_SECONDS - used, Math.ceil((nextMidnight(now) - now) / 1000));
  const validUntil = seconds > 0 ? Math.min(now + seconds * 1000, nextMidnight(now)) : 0;
  return {
    record: { day, used: used + seconds, sessionId, validUntil },
    response: { validUntil, remainingSeconds: FREE_SECONDS - used - seconds, serverNow: now },
  };
}
export function entitlementEnd(current, days, now) { return Math.max(current || 0, now) + days * 86400000; }
