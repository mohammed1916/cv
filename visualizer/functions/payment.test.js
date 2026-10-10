import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import process from 'node:process';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyProPayment, paymentWebhook, startProTrial, playgroundLease, createProOrder } from './index.js';
import { PLANS, TRIAL_MS } from './policy.js';

// Exercise real handlers with deterministic Firestore and Razorpay boundaries.
// This validates business logic without secrets, network calls or real payments.
process.env.RAZORPAY_KEY_ID = 'test-key';
process.env.RAZORPAY_KEY_SECRET = 'test-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook';
const db = getFirestore();
let records = new Map();
let payment;
const snapshot = path => ({ data: () => records.get(path) });
db.doc = path => ({ path, get: async () => snapshot(path), set: async data => { records.set(path, data); } });
db.runTransaction = async fn => fn({
  get: async ref => snapshot(ref.path),
  set: (ref, data, options) => records.set(ref.path, options?.merge ? { ...records.get(ref.path), ...data } : data),
  update: (ref, data) => records.set(ref.path, { ...records.get(ref.path), ...data }),
});
globalThis.fetch = async () => ({ ok: true, json: async () => payment });
function reset() {
  // Orders opened before the price change still verify against their stored amount.
  records = new Map([['orders/order_one', { uid: 'owner', plan: 'monthly', amount: 19900, status: 'created' }]]);
  payment = { id: 'pay_one', order_id: 'order_one', status: 'captured', amount: 19900, currency: 'INR', amount_refunded: 0 };
}
function request(user = 'owner') {
  return {
    auth: { uid: user, token: { firebase: { sign_in_provider: 'google.com' } } },
    data: {
      razorpay_order_id: 'order_one', razorpay_payment_id: 'pay_one',
      razorpay_signature: createHmac('sha256', 'test-secret').update('order_one|pay_one').digest('hex'),
    },
  };
}
async function webhook(event, payload) {
  const body = { event, payload };
  const rawBody = JSON.stringify(body);
  const signature = createHmac('sha256', 'test-webhook').update(rawBody).digest('hex');
  let code;
  await paymentWebhook({ method: 'POST', body, rawBody, get: () => signature }, { sendStatus: n => { code = n; } });
  assert.equal(code, 200);
}
test('captured payment grants once even with duplicate callback and webhook', async () => {
  reset();
  await verifyProPayment.run(request());
  const first = records.get('accounts/owner').expiresAt;
  assert.ok(first > Date.now() + 29 * 86400000);
  await verifyProPayment.run(request());
  await webhook('payment.captured', { payment: { entity: payment } });
  assert.equal(records.get('accounts/owner').expiresAt, first);
});

test('trial handler is authenticated, idempotent and grants unlimited playground until expiry', async t => {
  reset();
  const now = Date.now();
  t.mock.method(Date, 'now', () => now);
  await assert.rejects(startProTrial.run({ data: {} }), { code: 'unauthenticated' });
  const first = await startProTrial.run(request());
  assert.equal(first.trialEndsAt, now + TRIAL_MS);
  assert.equal((await startProTrial.run(request())).trialEndsAt, first.trialEndsAt);
  const leaseRequest = { ...request(), data: { sessionId: 'session-trial-test-123' } };
  assert.equal((await playgroundLease.run(leaseRequest)).pro, true);
  assert.equal(records.has('usage/owner'), false);
  t.mock.method(Date, 'now', () => now + TRIAL_MS);
  assert.equal((await startProTrial.run(request())).pro, false);
  const expiredLease = await playgroundLease.run(leaseRequest);
  assert.equal(expiredLease.pro, false);
  assert.equal(expiredLease.remainingSeconds, 1770);
});

test('checkout sends the trusted new monthly and annual prices, ignoring client amounts', async t => {
  t.mock.method(db, 'collection', () => ({ doc: () => ({ id: 'receipt_test' }) }));
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.currency, 'INR');
    return { ok: true, json: async () => ({ id: 'order_new', amount: body.amount }) };
  });
  for (const [plan, expected] of [['monthly', 1900], ['annual', 22800]]) {
    reset();
    records.set('config/billing', { enabled: true });
    const order = await createProOrder.run({ ...request(), data: { plan, amount: 1 } });
    assert.equal(order.amount, expected);
    assert.equal(records.get('orders/order_new').amount, expected);
    assert.equal(expected, PLANS[plan].amount);
  }
});

test('verified payment preserves unused trial time', async t => {
  reset();
  const now = Date.now();
  t.mock.method(Date, 'now', () => now);
  await startProTrial.run(request());
  await verifyProPayment.run(request());
  assert.equal(records.get('accounts/owner').expiresAt, now + TRIAL_MS + 30 * 86400000);
});
test('forged signatures, other accounts and wrong amount cannot grant access', async () => {
  reset();
  const forged = request(); forged.data.razorpay_signature = 'a'.repeat(64);
  await assert.rejects(verifyProPayment.run(forged), { code: 'permission-denied' });
  await assert.rejects(verifyProPayment.run(request('attacker')), { code: 'permission-denied' });
  payment.amount = 1;
  await assert.rejects(verifyProPayment.run(request()), { code: 'failed-precondition' });
  assert.equal(records.has('accounts/owner'), false);
});
test('uncaptured and refunded payments never grant Pro', async () => {
  reset(); payment.status = 'authorized';
  await assert.rejects(verifyProPayment.run(request()), { code: 'failed-precondition' });
  payment.status = 'captured'; payment.amount_refunded = 1;
  await assert.rejects(verifyProPayment.run(request()), { code: 'failed-precondition' });
  assert.equal(records.has('accounts/owner'), false);
});
test('refund delivered before capture marks order and delayed capture stays revoked', async () => {
  reset(); payment.amount_refunded = 19900;
  await webhook('refund.processed', { refund: { entity: { payment_id: 'pay_one' } } });
  await webhook('payment.captured', { payment: { entity: { ...payment, amount_refunded: 0 } } });
  assert.equal(records.get('orders/order_one').status, 'refunded');
  assert.equal(records.has('accounts/owner'), false);
});
test('duplicate refunds revoke once and preserve another purchased period', async () => {
  reset(); await verifyProPayment.run(request());
  const original = records.get('accounts/owner').expiresAt;
  records.set('accounts/owner', { expiresAt: original + 365 * 86400000 });
  payment.amount_refunded = 19900;
  const payload = { refund: { entity: { payment_id: 'pay_one' } } };
  await webhook('refund.processed', payload);
  const remaining = records.get('accounts/owner').expiresAt;
  assert.equal(remaining, original + 335 * 86400000);
  await webhook('refund.processed', payload);
  assert.equal(records.get('accounts/owner').expiresAt, remaining);
});

test('unrelated merchant payments are acknowledged without granting Pro', async () => {
  reset();
  payment.order_id = 'order_unrelated';
  await webhook('payment.captured', { payment: { entity: payment } });
  assert.equal(records.has('accounts/owner'), false);
  payment.order_id = null;
  await webhook('payment.captured', { payment: { entity: payment } });
  assert.equal(records.has('accounts/owner'), false);
});
