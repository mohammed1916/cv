# Web analytics setup and report coverage

Implemented 2026-11-07 for Firebase project `teemtreat-visualizer`, web measurement ID `G-N7TMKW7YXH`.

## Application behavior

Firebase Analytics loads only after explicit opt-in. The compact notice has equal Allow analytics and No thanks controls. Reopen it in Settings → Analytics preferences or `/?privacy=settings`. Consent lasts 180 days, synchronizes across tabs, and can be withdrawn; withdrawal disables collection and clears accessible GA cookies. Essential authentication/preferences continue independently. No rejected-session events are buffered for later upload. Vercel Analytics is no longer mounted.

Development analytics is off by default. For a dedicated test session use `VITE_ANALYTICS_DEBUG=true`, restart Vite, and explicitly consent. Events then carry `debug_mode`. Set `VITE_APP_VERSION` to the release identifier during production builds; the fallback is `web-2026-11-07`. Version is a custom `site_version`, not the native-app App version dimension.

## Required Google Analytics console configuration

These are property settings, not source-code changes. They have NOT been changed or verified by this implementation.

1. Open the linked GA4 property → Admin → Data streams → the web stream for `G-N7TMKW7YXH`. Confirm its domain is visualizer.pro.
2. Disable enhanced measurement (including history-based page views, form interactions, site search, outbound-link and file URL capture). This app sends explicit virtual page views with catalogue-approved paths/titles. `send_page_view:false` disables the configuration hit but does not by itself disable remotely configured history tracking. Leaving history tracking enabled can duplicate views and transmit unfiltered browser URLs. Basic session/engagement collection remains GA behavior after consent.
3. Keep Google Signals and advertising personalization disabled. Review account-level data-sharing settings separately; source code cannot change them.
4. Register event-scoped custom dimensions: `problem_id`, `site_version`, `panel_type`, `language`, and `plan` if those breakdowns are useful. Avoid registering transaction IDs as custom dimensions (high cardinality).
5. Mark `visualization_complete` and optionally `login` as key events if these match your success criteria. Review the default purchase key event. Do not mark every play or panel toggle as a conversion.
6. Select a justified event/user-data retention period (for example two months for minimal storage), review user-data reset-on-activity behavior, then record the actual setting here and reflect material changes in the privacy policy. No retention setting has been assumed or changed.
7. Use DebugView with a consenting test browser. Check one page_view per catalogue/problem/playground navigation, start/completion events, panel toggles, and withdrawal. Check the browser Network panel: no GA/Firebase Analytics initialization or collection before consent; no new collection after refusal/withdrawal. Authentication/hosting traffic is separate.
8. Configure an internal-traffic filter before using your own visits to assess real users. Test filters before activating them. Standard reports need processing time; Realtime/DebugView are the first diagnostic tools. Analytics cannot recover visits from before implementation or from visitors who declined.

## Events

| Event | Trigger | Explicit parameters |
| --- | --- | --- |
| page_view | App state moves to a catalogue/problem/playground/prerequisites screen, or consent is granted on the current screen | sanitized page_location, page_title, page_referrer, problem_id, site_version |
| visualization_start | Shared playback hook starts a run | problem_id, site_version |
| visualization_complete | A started shared-hook run reaches its final frame | problem_id, site_version |
| playground_run | Nonempty code submitted to the runtime (attempt, not a successful execution claim) | language |
| panel_toggle | Dock panel hidden/shown, including automated behavior | panel_type, visible |
| login | Google sign-in succeeds | method |
| app_error | React visualizer error boundary | error_type=render |
| begin_checkout | Server order created and checkout constructed | plan, value in INR (not paise), currency, items |
| purchase | Backend verifies a Razorpay payment | transaction_id, plan, value, currency, items |

Only enumerated event names/fields are accepted. No code, test inputs, prompts, email, account UID, raw errors, arbitrary DOM text, or query strings are passed by custom instrumentation. Purchase IDs enable GA transaction deduplication. Analytics purchases are consent-dependent browser observations, not an accounting ledger. Backend payment records remain authoritative. Refunds require a real verified refund workflow; no refunds, ad impressions, or revenue are fabricated. Legacy visualizers that do not use the shared playback hook receive page-view tracking but may not emit playback events.

## Dashboard cards

| Card | Source / limitation |
| --- | --- |
| Active users, last 30 minutes, countries, device/browser | Consented GA web traffic; location/device granularity depends on Google's processing and privacy thresholds |
| Engagement and engaged sessions | GA session/engagement signals after opt-in; meaningful visits must occur |
| Retention and cohorts | Returning consenting browsers over days/weeks; no retroactive population |
| Views by page title; event counts | Explicit SPA page_view and instrumented events |
| Key events | Console marking described above |
| Purchase revenue, revenue per user, customer value | Verified purchase events when checkout is enabled and real purchases occur; zero is expected during free beta/no sales |
| Acquisition/channel comparisons | Referring origin and GA channel attribution; URL campaign parameters are intentionally not forwarded |
| App version / latest native release | Native-app reports; use custom site_version for this web app |
| Crash-free users | Firebase Crashlytics native-app card; generic app_error events do not populate it |
| Ad revenue | Not applicable without an actual ad integration |
| Add comparison | GA report UI operation, not a tracking event or missing website feature |

## Validation performed

Consent/schema/race tests: `node --test src/analytics/analytics.test.mjs`.
Changed JSX/JS modules transformed with Vite. Production `npm run build` passed (existing large-chunk and Pyodide browser-externalization warnings). `git diff --check` passed. Browser access was unavailable and the native Chrome fallback timed out; live GA property settings and report ingestion have not been verified. Source changes alone are not a deployment or console acceptance result.

References: https://firebase.google.com/docs/reference/js/analytics ; https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications ; https://support.google.com/analytics/answer/9216061 .
