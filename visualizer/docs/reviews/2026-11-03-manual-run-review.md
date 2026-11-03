# Manual run review and Claude continuation — 2026-11-03

Reviewed baseline `d34b4d18`. The run is implemented and partially checked, not catalogue-complete. SQL, JavaScript APIs, Promises, concurrency and design classes remain in scope under `docs/CATALOG-COMPLETION-CONTRACT.md`; category labels are not permanent exclusion reasons. Ambiguous rules require a per-ID requirements blocker, not invented semantics.

## Verified in this review

- The range `ce80e562^..d34b4d18` touches **223 numbered problem folders**. This is a reproducible range count, not proof that the reported approximate 290 total is wrong: reconcile earlier batches explicitly.
- All **1,071 tests across those 223 algorithm.test.mjs files passed**, with zero skips. These tests do not certify official bounds, independent oracles, or visual semantics.
- All **612 literal routed presets** passed parsing, trace execution and pseudocode/Python line-range checks. Full per-ID evidence: [trace audit](2026-11-03-manual-run-traces.json). Valid line numbers do not prove that a highlighted line describes the displayed operation.
- Production `npm run build` passed after the 3616 correction below. Existing Pyodide browser-externalization warnings remain.

## Five loose files resolved without deleting work

`ArrivalLineView.css`, `ArrivalLineView.jsx`, `algorithm.test.mjs`, `index.jsx` and `meta.js` directly under `src/problems` were all byte-identical to committed files in `src/problems/Problem3616`. They were misplaced duplicates, not an unidentified unfinished problem. Moved them to ignored local reference storage at `local-reference/review-artifacts/2026-11-03-loose-3616/`. Do not reintroduce them at the source root. The numbered implementation remains in place.

## Browser is now available; actual teaching bug fixed

Playwright successfully connected to the local app at `http://localhost:3010/#number-of-student-replacements` after `npm run dev -- --host 0.0.0.0`. Port 5173 was incorrect for this checkout. Browser unavailability is no longer a valid blanket blocker in this environment.

Problem 3616 incorrectly identified selected students by matching their rank value. With `[7,7,7]`, several cards could appear selected although ties never replace the first student. The trace now carries `selectedIndex`; the view uses identity, and the result frame no longer marks the last arrival as the currently compared student. Added a regression for ties before/after a replacement and preserved earlier frame state.

Post-fix checks: six targeted tests pass. Browser checked Next, Play/Pause, result jump, Reset, Prev, Python/Pseudocode switching, the equal-rank preset, custom input `[9,2,2,1]` (two replacements), and invalid `[]` feedback. On `[7,7,7]`, exactly one selected card remains: arrival zero. At 390px viewport width the document width was 390px. This is **targeted interaction evidence**, not full acceptance: arbitrary timeline seeking, speed changes, all presets, screenshot/layout review and all other routes still need their gates.

The browser repeatedly reports duplicate React keys for these catalogue entries: random-pick-with-blacklist, employee-free-time, max-consecutive-ones-iii, distribute-candies-to-people, design-underground-system, maximum-distance-in-arrays. Investigate duplicate registration/identity at the source; do not hide the warning by inventing unstable keys. These console failures remain open.

## Next work, in order

1. Reconcile the exact built/skipped ID ledger against Git and the catalogue. Persist the agents' skip reasons if they exist only in messages. Counts like “about 248 SQL” or “about 126 others” are reported estimates until reconciled.
2. Fix duplicate catalogue keys and confirm unique official IDs/slugs/routes without dropping the preferred visual.
3. Run routed browser acceptance in batches. Wait for each route's own panel before interacting. Exercise presets, custom and invalid input, playback, back/seek/reset/speed, language switches, intermediate decision state and final output; inspect narrow-screen layout and console errors. Record per-ID results and failures. Do not label the other 222 audited folders browser-verified from the 3616 check.
4. Resolve source/contract gaps before declaring requirements complete. Agent-authored tests can repeat a misunderstood draft rule. Validate against available local recovered statements and attributed references; confirm exact bounds separately from visualization caps. Continue using independently authored website examples.
5. Resume category-specific work: SQL relational views with executable SQL checks; Promise/API operation timelines; persistent class-operation streams; concurrency schedules with explicit permitted nondeterminism. Use the category exceptions already authorized in the completion contract.
6. Continue legacy conversion and remaining missing/partial entries. A completed manual-file batch is not completion of the full catalogue. Preserve distinct statuses for requirements, solver tests, visual traces, browser acceptance and commits.

## Reproduce the range checks

Read the IDs from the trace JSON: each result contains preset rows with its ID. Run each folder's `algorithm.test.mjs` with `node --test`, and `node scripts/review-latest-visualizer-traces.mjs <ID>` for literal preset/line checks. The baseline report predates the identity fix; 3616 was separately retested and exercised afterward.
