import test from 'node:test';
import assert from 'node:assert/strict';
import { status, entitlementEnd, PLANS, PRICES, priceFor, trialStart, TRIAL_MS, refundable, REFUND_WINDOW_MS } from './policy.js';
import { isFreeProblem, PRICES as UI_PRICES, PLANS as UI_PLANS } from '../src/access/policy.js';
const UI_PLAN_DAYS = Object.fromEntries(Object.keys(UI_PLANS).map(key => [key, UI_PLANS[key].days]));
const now = Date.parse('2026-09-10T10:00:00Z');
test('entitlements expire and renewal extends only the remaining period', () => {
  assert.equal(status({ expiresAt: now }, now).pro, false);
  assert.equal(status({ expiresAt: now + 1 }, now).pro, true);
  assert.equal(entitlementEnd(now - 1, 30, now), now + 30 * 86400000);
  assert.equal(entitlementEnd(now + 1000, 30, now), now + 1000 + 30 * 86400000);
});
test('UI prices match trusted backend amounts in every currency', () => {
  for (const currency of Object.keys(PRICES)) {
    for (const plan of Object.keys(PLANS)) {
      assert.equal(UI_PRICES[currency][plan], PRICES[currency][plan], `${currency} ${plan}`);
      assert.equal(priceFor(plan, currency), PRICES[currency][plan]);
      assert.equal(UI_PLAN_DAYS[plan], PLANS[plan].days);
    }
  }
  assert.equal(priceFor('monthly', 'EUR'), null);
});

test('Basics and Easy plus curated Medium are free, unavailable entries are not sold', () => {
  const p = { implemented: true, difficulty: 'Hard', number: '42', tags: [] };
  assert.equal(isFreeProblem(p), true);
  assert.equal(isFreeProblem({ ...p, difficulty: 'Hard' }), true);
  assert.equal(isFreeProblem({ ...p, tags: ['Codeforces'] }), true);
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

test('refunds: only a recent, unrefunded paid order with a payment id qualifies', () => {
  const paid = { status: 'paid', paymentId: 'pay_1', paidAt: now - 1000 };
  assert.equal(refundable(paid, now), true);
  assert.equal(refundable({ ...paid, paidAt: now - REFUND_WINDOW_MS - 1 }, now), false);
  assert.equal(refundable({ ...paid, status: 'refund_requested' }, now), false);
  assert.equal(refundable({ ...paid, status: 'refunded' }, now), false);
  assert.equal(refundable({ ...paid, paymentId: undefined }, now), false);
  assert.equal(refundable({ status: 'created' }, now), false);
});
