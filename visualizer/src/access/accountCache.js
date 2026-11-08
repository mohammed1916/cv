// UI entitlement cache only. Payment validation remains server-side.
export const ACCOUNT_CACHE_MS = 6 * 60 * 60 * 1000;
const prefix = 'cpviz.account-status.v1:';
export function createAccountCache({ load, storage, now = Date.now }) {
  const pending = new Map();
  const memory = new Map();
  function put(uid, account) {
    const entry = { account, checkedAt: now() };
    memory.set(uid, entry);
    try { storage()?.setItem(prefix + uid, JSON.stringify(entry)); } catch { /* Memory cache still works. */ }
    return account;
  }
  async function get(uid, { force = false } = {}) {
    if (pending.has(uid)) return pending.get(uid);
    if (!force) {
      let entry = memory.get(uid);
      try { entry = JSON.parse(storage()?.getItem(prefix + uid) || 'null') || entry; } catch { /* Ignore invalid cache. */ }
      if (entry?.account && typeof entry.account.pro === 'boolean' && Number.isFinite(entry.checkedAt)
        && now() >= entry.checkedAt && now() - entry.checkedAt < ACCOUNT_CACHE_MS) return entry.account;
    }
    const request = Promise.resolve().then(() => load(uid)).then(account => put(uid, account)).finally(() => pending.delete(uid));
    pending.set(uid, request);
    return request;
  }
  function clear(uid) {
    memory.delete(uid);
    try { storage()?.removeItem(prefix + uid); } catch { /* Storage may be unavailable. */ }
  }
  return { get, put, clear };
}
