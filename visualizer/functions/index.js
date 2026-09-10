import { Buffer } from 'node:buffer';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PLANS, reserve, status, entitlementEnd } from './policy.js';
initializeApp();
const db = getFirestore();
const keyId = defineSecret('RAZORPAY_KEY_ID');
const keySecret = defineSecret('RAZORPAY_KEY_SECRET');
const webhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');
const options = { region: 'asia-south1', maxInstances: 10 };
const paymentOptions = { ...options, secrets: [keyId, keySecret] };
function uid(request) {
  if (!request.auth || request.auth.token.firebase?.sign_in_provider !== 'google.com') throw new HttpsError('unauthenticated', 'Sign in with Google.');
  return request.auth.uid;
}
export const accountStatus = onCall(options, async (request) => status((await db.doc(`accounts/${uid(request)}`).get()).data()));
export const playgroundLease = onCall(options, async (request) => {
  const user = uid(request);
  const sessionId = request.data?.sessionId;
  if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(sessionId)) throw new HttpsError('invalid-argument', 'Invalid session.');
  return db.runTransaction(async tx => {
    const account = await tx.get(db.doc(`accounts/${user}`));
    const ref = db.doc(`usage/${user}`);
    const usage = await tx.get(ref);
    const now = Date.now();
    const pro = status(account.data(), now);
    if (pro.pro) return { pro: true, validUntil: Math.min(now + 30000, pro.expiresAt), serverNow: now };
    const result = reserve(usage.data(), sessionId, now);
    if (result.record) tx.set(ref, result.record);
    return { ...result.response, pro: false };
  });
});
async function razorpay(path, body) {
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Basic ${Buffer.from(`${keyId.value()}:${keySecret.value()}`).toString('base64')}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new HttpsError('unavailable', 'Payment service is unavailable.');
  return response.json();
}
function validSignature(text, signature, secret) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(text).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
export const createProOrder = onCall(paymentOptions, async request => {
  const user = uid(request), plan = request.data?.plan;
  if (!Object.hasOwn(PLANS, plan || '')) throw new HttpsError('invalid-argument', 'Unknown plan.');
  // Launch switch is server-owned and absent by default.
  const config = (await db.doc('config/billing').get()).data();
  if (!config?.enabled) throw new HttpsError('failed-precondition', 'Checkout is not open yet.');
  const ref = db.collection('orders').doc();
  await db.runTransaction(async tx => {
    const rate = db.doc(`checkoutLimits/${user}`);
    const prior = (await tx.get(rate)).data();
    if (prior?.at > Date.now() - 30000) throw new HttpsError('resource-exhausted', 'Wait 30 seconds before starting another checkout.');
    tx.set(rate, { at: Date.now() });
  });
  const order = await razorpay('orders', { amount: PLANS[plan].amount, currency: 'INR', receipt: ref.id, notes: { product: 'visualizer-pro' } });
  await db.doc(`orders/${order.id}`).set({ uid: user, plan, amount: PLANS[plan].amount, status: 'created', createdAt: Date.now() });
  return { id: order.id, amount: PLANS[plan].amount, key: keyId.value() };
});
// Used by both verified checkout and signed webhooks. Duplicate deliveries do
// not extend a plan twice. Payment metadata never determines a trusted price.
async function activate(payment, expectedUid) {
  if (!/^order_[a-zA-Z0-9]+$/.test(payment.order_id || '')) throw new HttpsError('invalid-argument', 'Invalid order.');
  const orderRef = db.doc(`orders/${payment.order_id}`);
  return db.runTransaction(async tx => {
    const order = (await tx.get(orderRef)).data();
    if (!order || (expectedUid && order.uid !== expectedUid)) throw new HttpsError('permission-denied', 'Order does not belong to this account.');
    if (payment.status !== 'captured' || payment.currency !== 'INR' || payment.amount !== order.amount || payment.amount_refunded > 0) throw new HttpsError('failed-precondition', 'Payment has not been captured or was refunded.');
    if (order.status === 'refunded') throw new HttpsError('failed-precondition', 'Payment was refunded.');
    if (order.status === 'paid') return { activated: true };
    const accountRef = db.doc(`accounts/${order.uid}`);
    const account = (await tx.get(accountRef)).data();
    const expiresAt = entitlementEnd(account?.expiresAt, PLANS[order.plan].days, Date.now());
    tx.set(accountRef, { expiresAt }, { merge: true });
    tx.update(orderRef, { status: 'paid', paymentId: payment.id, expiresAt, paidAt: Date.now() });
    return { activated: true };
  });
}
export const verifyProPayment = onCall(paymentOptions, async request => {
  const user = uid(request);
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.data || {};
  if (!/^order_[a-zA-Z0-9]+$/.test(orderId || '') || !/^pay_[a-zA-Z0-9]+$/.test(paymentId || '') || !validSignature(`${orderId}|${paymentId}`, signature, keySecret.value())) throw new HttpsError('permission-denied', 'Invalid payment signature.');
  const payment = await razorpay(`payments/${paymentId}`);
  if (payment.order_id !== orderId) throw new HttpsError('permission-denied', 'Order mismatch.');
  return activate(payment, user);
});
export const paymentWebhook = onRequest({ ...options, secrets: [webhookSecret, keyId, keySecret] }, async (req, res) => {
  if (req.method !== 'POST') { res.sendStatus(405); return; }
  if (!validSignature(req.rawBody, req.get('x-razorpay-signature'), webhookSecret.value())) { res.sendStatus(401); return; }
  try {
    const event = req.body;
    const payment = event.payload?.payment?.entity;
    if (event.event === 'payment.captured' && payment) {
      const current = await razorpay(`payments/${payment.id}`);
      if (!current.amount_refunded) await activate(current);
    }
    if (event.event === 'refund.processed') {
      const refund = event.payload?.refund?.entity;
      if (refund?.payment_id) {
        const current = await razorpay(`payments/${refund.payment_id}`);
        if (current.order_id && /^order_[a-zA-Z0-9]+$/.test(current.order_id)) {
          const orderRef = db.doc(`orders/${current.order_id}`);
          await db.runTransaction(async tx => {
            const order = (await tx.get(orderRef)).data();
            if (!order || order.status === 'refunded') return;
            const accountRef = db.doc(`accounts/${order.uid}`);
            const account = (await tx.get(accountRef)).data();
            // Any refund revokes this access period. Other purchased time stays.
            if (order.status === 'paid') tx.set(accountRef, { expiresAt: Math.max(Date.now(), (account?.expiresAt || 0) - PLANS[order.plan].days * 86400000) }, { merge: true });
            tx.update(orderRef, { status: 'refunded', paymentId: refund.payment_id, refundedAt: Date.now() });
          });
        }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Payment event could not be applied', error.code || 'internal');
    res.sendStatus(500);
  }
});
