# Teem Treat Pro access

Access UI and payment backend implemented locally on September 10, 2026. Google Authentication configured in Firebase on September 11. Account and payment functions deployed on September 11; live checkout is enabled after the Razorpay webhook was saved and verified.

## Product decision

- Free: all Basics and Easy visualizers; Medium problems 2, 3, 11, 15, 33, 49, 53, 56, 62, 78, 98, 102, 198, 200, 238; tutorial; 30 minutes of playground per day after Google sign-in.
- Pro: every implemented visualizer and unlimited playground time. ₹199 for 30 days or ₹1,499 for 365 days. One-time purchases, no automatic renewal. AI provider quotas and charges remain separate.
- Catalog-only entries stay marked Coming soon; Pro does not make missing implementations available.
- Daily allowance resets at midnight Asia/Kolkata. Server reserves 30-second intervals while the playground tab is visible; closing a session may consume the remainder of its reserved interval. Only one free session can hold a reservation at once. Reservations survive refresh and device changes; Pro allows concurrent sessions.
- Expiring access hides and disables the playground but keeps the editor mounted. Source is also saved by the existing playground browser storage. Re-authentication or navigation can remount it.

## Current setup status

The existing Teem Treat Google flow is in `../../teemavenue_web/src/app/account/page.tsx` (relative to the visualizer checkout). The visualizer uses its own Firebase project, not the sweets site's accounts, secrets, or paid status.

September 11: registered web app `1:209065055325:web:b29889d959eb39a48ca9b4` using Firebase CLI Auth provisioning. Google provider is enabled, with display name CP Visualizer by Teem Treat and support contact greenelitesolutions@gmail.com. Authorized domains are teemtreat-visualizer.firebaseapp.com, teemtreat-visualizer.web.app, visualizer.teemtreat.com, localhost, and 127.0.0.1. Verified the project config endpoint succeeds and a Google OAuth URL can be created for http://127.0.0.1:3010/. A complete interactive Google login has not been tested.

Auth provider settings are checked into `firebase.json`; deploy only those with `firebase deploy --only auth --project teemtreat-visualizer`. Firebase automatically includes its own auth-handler redirect, so do not repeat that default URL in authorizedRedirectUris.

Razorpay dashboard was visibly logged in to the Visualizer by Teem Treat account, with website setup at 1/3 and live mode indicated. The initial browser setup was blocked by automation. On September 11, after the user upgraded to Blaze, the CLI confirmed billingEnabled=true; Firestore was created in asia-south1 and all five Node 22 functions were deployed successfully. Razorpay website approval and automatic capture were verified in the dashboard. Webhook TajM0RTQQY7RxO is saved and enabled at https://asia-south1-teemtreat-visualizer.cloudfunctions.net/paymentWebhook. Razorpay confirms a secret was supplied; the user selected 51 events, including payment.captured and refund.processed. The backend ignores unsupported events.

`VITE_ACCESS_BACKEND_ENABLED=true` is now set for Firebase builds and local development. `VITE_CHECKOUT_ENABLED=true` is set for Firebase builds and local development. The server-owned config/billing document has enabled=true. The source defaults still fail closed when deployment flags are missing.

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

## September 11 backend deployment verification

- All five functions report ACTIVE in asia-south1.
- accountStatus, playgroundLease, createProOrder and verifyProPayment reject unauthenticated calls with HTTP 401.
- paymentWebhook accepts a correctly signed setup.validation event (HTTP 200) and rejects an invalid signature (HTTP 401). No real payment was made.
- Unauthenticated Firestore reads return HTTP 403; deny-all browser rules are released.
- The live Razorpay key pair was validated with a read-only Orders API request and stored as RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Secret Manager. RAZORPAY_WEBHOOK_SECRET was generated separately and stored there; no secret values are recorded in this document.
- All 11 tests pass on Node 22, including duplicate callbacks/refunds and unrelated merchant payments.
- Artifact Registry cleanup retains function build images for seven days.
- Use an installed Node 22+ runtime for Firebase CLI deployment. The standalone Firebase binary bundles Node 20.18.2 and failed local function discovery with ERR_REQUIRE_ESM; running its JavaScript CLI with the installed Node runtime resolved that error.

September 11 live checkout verification: Google sign-in completed on the production custom domain; the server created an unpaid monthly order for 19900 paise. No payment was submitted by the agent. Native pricing dialogs now yield the browser top layer to Razorpay checkout and reopen on checkout dismissal or completion.
