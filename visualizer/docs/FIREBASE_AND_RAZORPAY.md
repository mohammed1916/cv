# Visualizer hosting and payments

## Deployment

- Firebase project: `teemtreat-visualizer` (209065055325).
- Hosting site: `teemtreat-visualizer`.
- Live Firebase URL: https://teemtreat-visualizer.web.app
- Custom domain: `visualizer.teemtreat.com`, registered in Firebase. Cloudflare CNAME and certificate TXT records were added and verified against its authoritative nameserver on September 8, 2026; Firebase certificate provisioning is pending.
- The sweets site's Firebase project and apex domain are separate.
- No paid Cloud Billing account was linked as part of this deployment.

Deploy from this directory:

```sh
firebase deploy --only hosting --project teemtreat-visualizer
```

The predeploy hook runs `npm run build:firebase`. `.env.firebase` disables Vercel Web Analytics for that build; the ordinary Vercel build retains the existing integration.

This is static Hosting. The Vercel `api/chat.js` endpoint is not deployed by Firebase Hosting. Hosted AI, payment processing, and access enforcement need a backend deployment before they can operate here. Do not enable paid checkout until server-side payment verification and access provisioning exist. Firebase Functions deployment normally requires the Blaze plan; review billing before enabling it.

## Custom domain DNS

Cloudflare is authoritative for `teemtreat.com`. The following Firebase-requested records are now saved and publicly resolving:

| Type | Cloudflare name | Value | Proxy |
| --- | --- | --- | --- |
| CNAME | visualizer | teemtreat-visualizer.web.app | DNS only |
| TXT | _acme-challenge.visualizer | ZG5DywM3QWkPjmo96k-MfeQI9UsFb_6M9fo-GccxHVs | Not applicable |

The TXT challenge can change: use the current values in Firebase Hosting's custom-domain setup if these no longer match. Leave the sweets site's apex, www, email, and existing verification records intact. Wait for Firebase ownership verification and SSL certificate provisioning, then verify HTTPS on the custom domain. Do not bypass certificate warnings.

Console: https://console.firebase.google.com/project/teemtreat-visualizer/hosting

Reference: https://firebase.google.com/docs/hosting/custom-domain

## Separate Razorpay billing

A shared parent domain does not require sharing a merchant account. A separate Firebase project isolates hosting resources; it does not create a separate Razorpay merchant account or a separate Google Cloud billing invoice.

1. Sign in at https://dashboard.razorpay.com and use the account switcher / multi-account setup to request another merchant account for the visualizer. If unavailable, contact Razorpay support about a separate account under the same legal business for a digital learning product. Merely adding an additional website to the sweets account does not separate its merchant ledger.
2. Complete the requested business verification using the actual legal entity details. Describe the product as paid access to a programming visualization / learning service. Use `https://visualizer.teemtreat.com` as its website once DNS and HTTPS are working. Razorpay decides whether the account and business category qualify.
3. Provide the intended settlement bank details. A separate merchant account gives separate payment reporting; a different eligible settlement bank account may be needed if separate bank statements are also desired. Confirm the arrangement with Razorpay.
4. Publish accurate pricing, support/contact details, terms, privacy, cancellation/refund conditions, and digital-access delivery timing before requesting activation. Adapt these to software access; do not copy perishable-food or shipping policies.
5. In the new merchant account, generate Test Mode API keys. Keep its keys separate from the sweets account. Store secrets only in the visualizer backend's secret configuration, never in `VITE_*` variables, source control, or browser code.
6. Implement server-created orders using trusted plan prices and the signed-in user. Verify the payment signature, order ownership, amount, currency, and captured status on the server before granting access in the database.
7. Configure a webhook in the new account after the backend URL exists. Verify the raw-body signature using a separate webhook secret; process duplicate events safely and reconcile captures, failures, refunds, and access changes. This static deployment does not yet expose a webhook URL.
8. Test successful, failed, abandoned, duplicate, and refunded payments, including checkout closed before returning to the app. Check that users cannot grant themselves access through browser state.
9. After account activation and end-to-end tests, configure the new account's Live Mode keys and live webhook. Confirm the billing label and receipt clearly identify the visualizer and its legal operator.

Razorpay references:

- Account setup and multi-account support: https://razorpay.com/docs/payments/set-up/
- Website details: https://razorpay.com/docs/payments/dashboard/account-settings/business-website-details/
- Checkout verification: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- Webhooks: https://razorpay.com/docs/webhooks/

No Razorpay account, checkout, subscriptions, billing linkage, or paid-access system was created during the Hosting setup.
