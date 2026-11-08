import test from 'node:test';
import assert from 'node:assert/strict';
import { status, entitlementEnd, PLANS, trialStart, TRIAL_MS } from './policy.js';
import { isFreeProblem, PLANS as UI_PLANS } from '../src/access/policy.js';
const now = Date.parse('2026-09-10T10:00:00Z');
test('entitlements expire and renewal extends only the remaining period', () => {
  assert.equal(status({ expiresAt: now }, now).pro, false);
  assert.equal(status({ expiresAt: now + 1 }, now).pro, true);
  assert.equal(entitlementEnd(now - 1, 30, now), now + 30 * 86400000);
  assert.equal(entitlementEnd(now + 1000, 30, now), now + 1000 + 30 * 86400000);
});
test('UI prices match trusted backend amounts', () => {
  assert.equal(PLANS.monthly.amount, 9900);
  assert.equal(PLANS.annual.amount, 79900);
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
