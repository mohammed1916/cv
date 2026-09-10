export const FREE_SECONDS = 1800;
export const PLANS = { monthly: { amount: 19900, days: 30 }, annual: { amount: 149900, days: 365 } };
export const indiaDay = (now) => new Date(now + 19800000).toISOString().slice(0, 10);
export const nextMidnight = (now) => Date.parse(`${indiaDay(now)}T00:00:00+05:30`) + 86400000;
export function status(data = {}, now = Date.now()) {
  return { pro: Number(data.expiresAt || 0) > now, expiresAt: Number(data.expiresAt || 0) };
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
