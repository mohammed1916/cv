import test from 'node:test';
import assert from 'node:assert/strict';
import { reserve, indiaDay, nextMidnight, status, entitlementEnd, PLANS, trialStart, TRIAL_MS } from './policy.js';
import { isFreeProblem, PLANS as UI_PLANS } from '../src/access/policy.js';
const now = Date.parse('2026-09-10T10:00:00Z');
test('allowance survives reload, forbids concurrent sessions and stops at 30 minutes', () => {
  let data = {};
  for (let i = 0; i < 60; i++) {
    const slice = reserve(data, 'session-a', now + i * 30000);
    assert.equal(slice.response.validUntil, now + (i + 1) * 30000);
    data = slice.record;
    assert.equal(reserve(data, 'session-a', now + i * 30000 + 1).record, null);
    assert.equal(reserve(data, 'session-b', now + i * 30000 + 1).response.inUse, true);
  }
  const end = reserve(data, 'session-a', now + 1800000);
  assert.equal(end.response.validUntil, 0);
  assert.equal(end.response.remainingSeconds, 0);
});
test('quota resets at midnight IST, including a reservation across midnight', () => {
  const last = Date.parse('2026-09-10T18:29:50Z');
  const slice = reserve({}, 'a', last);
  assert.equal(slice.response.validUntil, Date.parse('2026-09-10T18:30:00Z'));
  assert.equal(indiaDay(last), '2026-09-10');
  const tomorrow = reserve({ ...slice.record, used: 1800 }, 'a', nextMidnight(last));
  assert.equal(tomorrow.response.remainingSeconds, 1770);
});
test('entitlements expire and renewal extends only the remaining period', () => {
  assert.equal(status({ expiresAt: now }, now).pro, false);
  assert.equal(status({ expiresAt: now + 1 }, now).pro, true);
  assert.equal(entitlementEnd(now - 1, 30, now), now + 30 * 86400000);
  assert.equal(entitlementEnd(now + 1000, 30, now), now + 1000 + 30 * 86400000);
});
test('UI prices match trusted backend amounts', () => {
  assert.equal(PLANS.monthly.amount, 1900);
  assert.equal(PLANS.annual.amount, 22800);
  assert.equal(PLANS.annual.amount, PLANS.monthly.amount * 12);
  for (const key of Object.keys(PLANS)) {
    assert.equal(UI_PLANS[key].amount, PLANS[key].amount);
    assert.equal(UI_PLANS[key].days, PLANS[key].days);
  }
});
test('Basics and Easy plus curated Medium are free, unavailable entries are not sold', () => {
  const p = { implemented: true, difficulty: 'Hard', number: '42', tags: [] };
  assert.equal(isFreeProblem(p), false);
  assert.equal(isFreeProblem({ ...p, tags: ['Basics'] }), true);
  assert.equal(isFreeProblem({ ...p, difficulty: 'Easy' }), true);
  assert.equal(isFreeProblem({ ...p, number: '200', difficulty: 'Medium' }), true);
  assert.equal(isFreeProblem({ ...p, number: '2333', difficulty: 'Medium' }), true);
  assert.equal(isFreeProblem({ ...p, number: '2333', tags: ['Codeforces'] }), false);
  assert.equal(isFreeProblem({ ...p, number: '200', tags: ['Codeforces'] }), false);
  assert.equal(isFreeProblem({ ...p, implemented: false }), true);
});

test('trial lasts exactly 72 hours and cannot be restarted or granted after paid access', () => {
  const trial = trialStart({}, now);
  assert.equal(TRIAL_MS, 72 * 60 * 60 * 1000);
  assert.equal(trial.trialEndsAt, now + TRIAL_MS);
  assert.equal(status(trial, now).trialActive, true);
  assert.equal(status(trial, now + TRIAL_MS - 1).pro, true);
  assert.equal(status(trial, now + TRIAL_MS).pro, false);
  assert.equal(status(trial, now + TRIAL_MS).trialAvailable, false);
  assert.equal(trialStart(trial, now + TRIAL_MS), null);
  assert.equal(trialStart({ expiresAt: now - 1 }, now), null);
  assert.equal(trialStart({ expiresAt: now + 1 }, now), null);
});

test('purchase during trial keeps its remaining time without changing the trial deadline', () => {
  const trial = trialStart({}, now);
  const expiresAt = entitlementEnd(status(trial, now + 1000).expiresAt, PLANS.monthly.days, now + 1000);
  assert.equal(expiresAt, trial.trialEndsAt + 30 * 86400000);
  assert.equal(status({ ...trial, expiresAt }, now).paid, true);
  assert.equal(status({ ...trial, expiresAt }, now).trialActive, false);
});
