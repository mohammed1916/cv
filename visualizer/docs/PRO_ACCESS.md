# Teem Treat Pro access

Implemented locally on September 10, 2026. Not deployed or accepting payments.

## Product decision

- Free: all Basics and Easy visualizers; Medium problems 2, 3, 11, 15, 33, 49, 53, 56, 62, 78, 98, 102, 198, 200, 238; tutorial; 30 minutes of playground per day after Google sign-in.
- Pro: every implemented visualizer and unlimited playground time. ₹199 for 30 days or ₹1,499 for 365 days. One-time purchases, no automatic renewal. AI provider quotas and charges remain separate.
- Catalog-only entries stay marked Coming soon; Pro does not make missing implementations available.
- Daily allowance resets at midnight Asia/Kolkata. Server reserves 30-second intervals while the playground tab is visible; closing a session may consume the remainder of its reserved interval. Only one free session can hold a reservation at once. Reservations survive refresh and device changes; Pro allows concurrent sessions.
- Expiring access hides and disables the playground but keeps the editor mounted. Source is also saved by the existing playground browser storage. Re-authentication or navigation can remount it.

## Current setup status

The existing Teem Treat Google flow is in `../../teemavenue_web/src/app/account/page.tsx` (relative to the visualizer checkout). The visualizer uses its own Firebase project, not the sweets site's accounts, secrets, or paid status.

Read-only Firebase inspection found no registered web apps in `teemtreat-visualizer`. Its Hosting reserved configuration supplies the public project/API configuration used in `src/access/firebase.js`. Google provider activation has not been verified. The code is wired, but a real sign-in has not been tested.

`VITE_ACCESS_BACKEND_ENABLED` and `VITE_CHECKOUT_ENABLED` are off by default. Until backend setup, free visualizers and tutorial work; the playground explains that account access is being set up. Do not publish this change expecting playground usage or paid checkout to work without the following setup.

## Backend setup

1. Register a Firebase web app for `teemtreat-visualizer`. Enable Firebase Authentication → Google with the correct support email. Authorize `visualizer.teemtreat.com`, `teemtreat-visualizer.web.app`, and localhost for development. Verify the public web API key matches `src/access/firebase.js`; override it with `VITE_FIREBASE_API_KEY` if needed. The Google popup uses `teemtreat-visualizer.firebaseapp.com`.
2. Enable Firestore, selecting its permanent region deliberately. Cloud Functions need a billing-enabled Firebase project; no billing account has been linked by this change. Functions are configured for `asia-south1`, Node 22.
3. Install functions dependencies with `npm ci --prefix functions`. Keep Razorpay secrets in Firebase Secret Manager, never in Vite environment variables:
   ```sh
   firebase functions:secrets:set RAZORPAY_KEY_ID --project teemtreat-visualizer
   firebase functions:secrets:set RAZORPAY_KEY_SECRET --project teemtreat-visualizer
   firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET --project teemtreat-visualizer
   ```
4. Deploy rules and functions only after project/billing setup:
   ```sh
   firebase deploy --only firestore:rules,functions --project teemtreat-visualizer
   ```
   Browser database reads and writes are denied. Callable functions require a Firebase Google-authenticated user. Pro status is determined by server-owned `accounts/{uid}.expiresAt`, not user-writable claims or local storage.
5. Set `VITE_ACCESS_BACKEND_ENABLED=true` in the deployment environment, rebuild, and test Google sign-in plus the daily quota against the backend. Keep checkout disabled for this first step.
6. Use the visualizer's separate Razorpay merchant account. Use Test Mode first. Enable automatic capture. Set the webhook to the deployed `paymentWebhook` URL and subscribe to `payment.captured` and `refund.processed`. Checkout return and webhook both verify captured payment amount/currency and stored order ownership before a transactional, idempotent grant. Signed refund events revoke that order's period; partial refunds also revoke the whole period. Document that policy before selling.
7. Test success, failure, abandoned checkout, webhook before/after checkout callback, duplicate events, out-of-order refund/capture, concurrent calls, account switching, expired Pro, and free quota across browsers and midnight. No real payments have been executed. Policy tests do not replace these integration checks.
8. Complete support contact, terms, refund policy, applicable price/tax disclosure and merchant activation. Then set server-owned Firestore document `config/billing` to `{ enabled: true }` and build with `VITE_CHECKOUT_ENABLED=true`. Both switches are necessary; leave both disabled until launch checks pass. After switching keys to live, update webhook secrets and deploy those function versions again.
9. Deploy Hosting only after the intended environment is verified. Existing `firebase deploy --only hosting` does not deploy these new functions.

## Important limits

This is an application access gate, not DRM: the Vite site still distributes client-side visualizer and runtime assets. Server-owned account/usage/payment records prevent browser edits from granting real Pro entitlements, but a technically capable user can modify client JavaScript or inspect public assets. If private delivery of paid code is required, move that content behind authenticated server endpoints before launch.

No client-side admin or fake payment bypass is included. Reconciliation after uncertain checkout uses Refresh access; do not prompt the user to pay twice. Webhooks are required for payments completed after the browser closes. Provider outages fail closed for playground sessions.

## Verification

```sh
npm run test:access
npx eslint src/access/AccessUI.jsx src/access/useAccess.js src/access/firebase.js src/access/policy.js src/App.jsx functions/index.js functions/policy.js functions/policy.test.js functions/payment.test.js
npm run build:firebase
```

References: [Firebase Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [Razorpay standard checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).

Latest local checks: production Firebase build passed; targeted ESLint and whitespace checks passed; 10 tests passed, including the actual payment handlers with mocked Firestore/Razorpay boundaries. Real backend transactions, Google OAuth, Razorpay Test Mode and visual browser QA remain unverified. No browser was available in the session.

Dependency check: the new backend uses current Firebase Admin/Functions releases. `npm audit` still reports two moderate transitive findings (`gaxios` / `uuid`); `npm audit fix` did not resolve them. Review the upstream dependency update before launch. Local tests ran on Node 24; deployed functions target Node 22, so verify in that runtime during integration testing.
