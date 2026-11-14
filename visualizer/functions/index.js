import { Buffer } from 'node:buffer';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PLANS, status, entitlementEnd, trialStart, refundable } from './policy.js';
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
const COMPLIMENTARY_EMAILS = new Set(['greenelitesolutions@gmail.com']);
// While the site is in beta, every verified Google sign-in gets Pro for free.
// Set to false to return to the allowlist above.
const BETA_FREE_PRO = false;
function complimentary(request) {
  const token = request.auth?.token;
  if (token?.email_verified !== true) return false;
  return BETA_FREE_PRO || COMPLIMENTARY_EMAILS.has(String(token.email || '').toLowerCase());
}
function accountPro(request, data, now) {
  const pro = status(data, now);
  return complimentary(request) ? { ...pro, pro: true, complimentary: true } : pro;
}
export const accountStatus = onCall(options, async (request) => accountPro(request, (await db.doc(`accounts/${uid(request)}`).get()).data(), Date.now()));
export const startProTrial = onCall(options, async request => {
  const ref = db.doc(`accounts/${uid(request)}`);
  return db.runTransaction(async tx => {
    const data = (await tx.get(ref)).data() || {};
    const now = Date.now();
    const trial = trialStart(data, now);
    if (trial) tx.set(ref, trial, { merge: true });
    return status({ ...data, ...trial }, now);
  });
});
// Compatibility for already-open older clients. New clients never call this.
// Paid/trial/complimentary access uses the same account entitlement, without
// usage records, time-slice reservations or single-device restrictions.
export const playgroundLease = onCall(options, async (request) => {
  const user = uid(request);
  const now = Date.now();
  const pro = accountPro(request, (await db.doc(`accounts/${user}`).get()).data(), now);
  return { ...pro, serverNow: now, remainingSeconds: 0,
    validUntil: pro.pro ? Math.min(now + 6 * 60 * 60 * 1000, pro.complimentary ? Infinity : pro.expiresAt || Infinity) : 0 };
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
  if (!/^order_[a-zA-Z0-9]+$/.test(payment.order_id || '')) {
    if (!expectedUid) return { ignored: true };
    throw new HttpsError('invalid-argument', 'Invalid order.');
  }
  const orderRef = db.doc(`orders/${payment.order_id}`);
  return db.runTransaction(async tx => {
    const order = (await tx.get(orderRef)).data();
    // The merchant may also receive payments through Razorpay.me or links.
    // Acknowledge those events without retrying or granting product access.
    if (!order && !expectedUid) return { ignored: true };
    if (!order || (expectedUid && order.uid !== expectedUid)) throw new HttpsError('permission-denied', 'Order does not belong to this account.');
    if (payment.status !== 'captured' || payment.currency !== 'INR' || payment.amount !== order.amount || payment.amount_refunded > 0) throw new HttpsError('failed-precondition', 'Payment has not been captured or was refunded.');
    if (order.status === 'refunded') throw new HttpsError('failed-precondition', 'Payment was refunded.');
    if (order.status === 'paid') return { activated: true };
    const accountRef = db.doc(`accounts/${order.uid}`);
    const account = (await tx.get(accountRef)).data();
    const expiresAt = entitlementEnd(status(account).expiresAt, PLANS[order.plan].days, Date.now());
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
// Account holder asks for a full refund of a recent Pro purchase. Razorpay
// confirms the refund later through the signed webhook, which removes access.
export const requestRefund = onCall(paymentOptions, async request => {
  const user = uid(request);
  const now = Date.now();
  const snapshot = await db.collection('orders').where('uid', '==', user).where('status', '==', 'paid').get();
  const order = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(item => refundable(item, now))
    .sort((a, b) => b.paidAt - a.paidAt)[0];
  if (!order) throw new HttpsError('failed-precondition', 'No purchase in the last 7 days can be refunded.');
  const orderRef = db.doc(`orders/${order.id}`);
  const claimed = await db.runTransaction(async tx => {
    const current = (await tx.get(orderRef)).data();
    if (!refundable(current, now)) return false;
    tx.update(orderRef, { status: 'refund_requested', refundRequestedAt: now });
    return true;
  });
  if (!claimed) throw new HttpsError('failed-precondition', 'This purchase is already being refunded.');
  try {
    await razorpay(`payments/${order.paymentId}/refund`, { amount: order.amount, speed: 'normal', notes: { policy: 'visualizer-pro-7-day' } });
  } catch (error) {
    await orderRef.update({ status: 'paid' });
    throw error;
  }
  return { status: 'refund_requested' };
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
            if (order.status === 'paid' || order.status === 'refund_requested') tx.set(accountRef, { expiresAt: Math.max(Date.now(), (account?.expiresAt || 0) - PLANS[order.plan].days * 86400000) }, { merge: true });
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

// User feedback: only signed-in Google accounts may submit. Stored in the
// `feedback` collection, which clients cannot read or write directly.
const FEEDBACK_RATINGS = new Set(['terrible', 'bad', 'okay', 'good', 'amazing']);
const FEEDBACK_CATEGORIES = new Set(['bug', 'ui', 'ux', 'pricing', 'loading', 'animation', 'support', 'payment']);
export const submitFeedback = onCall(options, async request => {
  const user = uid(request);
  const data = request.data || {};
  const rating = String(data.rating || '');
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const categories = Array.isArray(data.categories) ? data.categories.map(String) : [];
  if (!FEEDBACK_RATINGS.has(rating)) throw new HttpsError('invalid-argument', 'Choose a rating.');
  if (message.length > 2000) throw new HttpsError('invalid-argument', 'Feedback must be 2000 characters or fewer.');
  if (categories.some(c => !FEEDBACK_CATEGORIES.has(c)) || categories.length > 5) throw new HttpsError('invalid-argument', 'Unknown feedback category.');
  const token = request.auth.token || {};
  await db.collection('feedback').add({
    uid: user,
    email: String(token.email || '').slice(0, 320),
    emailVerified: token.email_verified === true,
    name: String(token.name || '').slice(0, 200),
    rating,
    categories: [...new Set(categories)],
    message,
    page: String(data.page || '').slice(0, 200),
    createdAt: Date.now(),
  });
  return { ok: true };
});
