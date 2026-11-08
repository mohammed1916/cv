# Cloud Function call audit and access simplification

Read-only Cloud Monitoring query for project `teemtreat-visualizer`, 2026-11-08.

Last seven days at audit time: accountStatus 5,593; playgroundLease 18; createProOrder 2; startProTrial 2. Both Cloud Run request_count and Cloud Functions execution_count returned these counts; they represent the same traffic and must NOT be added together.

Last 24 hours (2026-11-07 07:07:22 UTC through 2026-11-08 07:07:22 UTC): accountStatus 684, playgroundLease 4. These are project-wide execution counts, not a count of unique visitors. No exact match to the user's unspecified 1.5K dashboard window is claimed.

Cause: useAccess polled accountStatus every 60 seconds even when the tab was idle. One open tab can generate 1,440 calls/day. PlaygroundGate additionally requested 30-second leases (renewed about four seconds early) even for Pro accounts.

Changes:
- No account-status background polling. Read once on account load when no fresh cache exists.
- Cache per account in localStorage for six hours, shared by subsequent page loads/tabs; deduplicate concurrent requests within a page. Simultaneous cold tabs may each make their initial request.
- Explicit Refresh access and post-payment refresh bypass cache; trial activation updates it directly. Sign-out clears that account's cache. Failed calls are not cached.
- Pro, active trials and existing complimentary accounts use one entitlement for all paid features including the playground.
- No playground leases from the new client; no quotas, time reservations, or single-device restrictions. Non-Pro users retain free visualizers and can activate their eligible trial or purchase Pro for the playground. The former daily 30-minute free playground allowance is retired.
- Retain playgroundLease as a compatibility endpoint for older clients, with up to six hours for Pro (bounded by actual expiry), no session ID requirement and no usage database reads/writes. Historical usage records are preserved.
- Preserve server-side authentication, trusted prices, payment signature/capture verification and idempotent activation/refunds.

Tradeoff: this is deliberately a relaxed UI entitlement cache. External upgrades/refunds/revocations are reflected on explicit refresh or a later uncached account load, not pushed into an already-open tab. The known expiry still disables Pro locally. The cache is not used to authorize server payment operations.

Validation: 20 access/payment/cache tests passed; production build passed; git diff --check passed. Source changes have not been deployed. To affect live traffic, deploy Hosting and the updated playgroundLease function. Already-open clients continue polling accountStatus until reloaded; the compatibility function only reduces their playground renewals. Analytics console setup described in docs/analytics/SETUP.md is still pending from the preceding change.
