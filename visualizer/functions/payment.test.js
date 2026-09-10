import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import process from 'node:process';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyProPayment, paymentWebhook } from './index.js';

// Exercise real handlers with deterministic Firestore and Razorpay boundaries.
// This validates business logic without secrets, network calls or real payments.
process.env.RAZORPAY_KEY_ID = 'test-key';
process.env.RAZORPAY_KEY_SECRET = 'test-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook';
const db = getFirestore();
let records = new Map();
let payment;
const snapshot = path => ({ data: () => records.get(path) });
db.doc = path => ({ path });
db.runTransaction = async fn => fn({
  get: async ref => snapshot(ref.path),
  set: (ref, data, options) => records.set(ref.path, options?.merge ? { ...records.get(ref.path), ...data } : data),
  update: (ref, data) => records.set(ref.path, { ...records.get(ref.path), ...data }),
});
globalThis.fetch = async () => ({ ok: true, json: async () => payment });
function reset() {
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
