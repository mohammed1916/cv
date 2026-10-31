import test from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { getFirestore } from 'firebase-admin/firestore';
import { accountStatus, playgroundLease } from './index.js';

// Complimentary Pro is granted only to a verified email on the allowlist.
process.env.RAZORPAY_KEY_ID = 'test-key';
process.env.RAZORPAY_KEY_SECRET = 'test-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook';
const db = getFirestore();
const snapshot = () => ({ data: () => undefined });
db.doc = path => ({ path, get: async () => snapshot(path) });
const records = new Map();
db.runTransaction = async fn => fn({ get: async ref => snapshot(ref.path), set: (ref, data) => records.set(ref.path, data) });

function request(token) {
  return { auth: { uid: 'u1', token: { firebase: { sign_in_provider: 'google.com' }, ...token } }, data: { sessionId: 'session-complimentary-123' } };
}

test('allowlisted verified email gets Pro without a paid or trial account', async () => {
  const req = request({ email: 'GreeneliteSolutions@gmail.com', email_verified: true });
  assert.equal((await accountStatus.run(req)).pro, true);
  assert.equal((await playgroundLease.run(req)).pro, true);
});

test('allowlisted email without verification does not get Pro', async () => {
  const req = request({ email: 'greenelitesolutions@gmail.com', email_verified: false });
  assert.equal((await accountStatus.run(req)).pro, false);
  assert.equal((await playgroundLease.run(req)).pro, false);
});

test('other verified emails do not get Pro', async () => {
  const req = request({ email: 'developermohammed01@gmail.com', email_verified: true });
  assert.equal((await accountStatus.run(req)).pro, false);
});
