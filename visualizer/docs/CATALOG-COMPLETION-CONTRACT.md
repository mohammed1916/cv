# Claude: complete the entire LeetCode visualizer catalog

Authoritative continuation requirements, 2026-11-02. User objective: solve and properly visualize **every LeetCode problem**, finish partial repairs, convert legacy implementations, source/build missing entries, and validate playback. These are all one job. Continue authorized work without asking again whether legacy conversion, source collection, ordinary fixes, verification or scoped commits are wanted.

This document defines the work, not a claim it is finished. No prompt can override context limits, unavailable tools or inaccessible statements. At a session boundary, leave a precise durable checkpoint and resume from it next session. Do not describe exhaustion of a batch or one failed fetch as exhaustion of the task.

## Recovered full statements: correction to the previous inventory

Read [archive recovery evidence](statement-sources/RECOVERY.md) first. Full source text is locally available for 2,984 catalog entries at `local-reference/leetcode/raw/<slug>.json`. It was recovered byte-for-byte from historical Git, outside the app public directory. The prior inventory counted only summaries and missed this deleted archive. Prefer the local full text before retrying network access. There remain 304 free and 785 paid catalog entries without full cached text; summaries and full-text coverage are separate dimensions. A historical statement still needs review for changes or ambiguities.

## Read order and precedence

1. This contract, then [latest nine-problem review](reviews/2026-11-02-latest-visualization-review.md). Fix its correctness and broken-preset defects before propagating their patterns.
2. [Source/held-work evidence](reviews/2026-11-02-claude-unblock.md) and [source workflow](statement-sources/README.md).
3. [Historical detailed handoff](CLAUDE-CATALOG-HANDOFF.md), especially the original 56-problem acceptance queue and partial-repair details. Its dated counts/HEAD/dirty-state statements are historical.
4. Relevant current source, tests, route definitions and `git status`. Current code/evidence overrides old status prose. This contract overrides historical skip-tests, stop-after-batch and legacy-out-of-scope guidance.

Do not discard useful authored scenes to achieve a uniform shell. Migrate them into the shared `AlgorithmWorkspace` contract with problem-specific views. If a necessary architectural exception remains, record it explicitly; do not silently count it as literal template completion.

## Actual starting evidence

Reviewed baseline: `cff33e863`, branch `host`. Check again before editing.

- Latest nine reviewed: 3785, 3788, 3789, 3797, 3800, 3818, 3838, 3842, 3880. 38 solver tests pass; 9/25 actual presets fail frame-line or parsing checks. Browser acceptance remains unperformed in this review. The review supplies exact repair criteria.
- Held work is **36 tracked files across 12 folders**, not 36 folders: 2357, 2365, 2448, 2451, 2452, 2453, 2455, 2460, 2469, 2481, 2490, 2498, plus 12 untracked test files. Preserve, compare and merge improvements. No blanket reset/restore/clean. Read the comparative evidence before reconciling.
- Historical manifest: 4,073 entries, with 1,416 verified / 17 partial / 1,451 legacy / 1,189 missing. These are old classifications, **not current certified totals**. Reconcile the manifest against files/routes/tests/commits; never subtract a batch from stale counts and call that a new audit.
- The [statement directory](statement-sources/INDEX.md) links every stored catalog entry. It does not contain full requirements for all entries. After this review's 3880 source note: 211 cached summaries, 147 failed-attempt-only records, 3,715 link-only entries. Read each summary for completeness; a summary's existence is not verification.
- Source-ready next candidates include 3017, 3020, 3030, 3139, 3149; inspect current implementation before creating anything. The earlier 3785/3788/3789/3797/3800 source batch already has implementations.
- Catalog membership is a stored snapshot, not a live claim about LeetCode's total. Refresh/discover newer official identities when possible, preserve old entries, and date the final coverage boundary. If refresh is blocked, finish the known snapshot and disclose the unknown newer inventory separately.

## Durable work accounting

Use `docs/catalog-manifest.json` as the coverage ledger, preserving its schema and existing evidence. Reconcile `.dev/solved.json`, `.dev/unsolved.json`, `.dev/meta.json` and retry queues if present; these must not silently disagree. Inspect generator behavior before regenerating anything that could overwrite richer evidence. Add a durable progress/checkpoint document if needed, linked here and from `CLAUDE.md`.

For **each ID**, track separately: identity/slug/category; requirements source and exact unresolved rules; implementation path and route; JS/domain correctness; Python or category-appropriate equivalent; pseudocode; frame/teaching-state checks; browser acceptance; build/integration evidence; commit; remaining blockers and next action. Record evidence date and revision so changes invalidate affected old checks. `unknown`, `blocked`, `failed`, `pending` and `passed` are different states. A placeholder, route, file count, test count or commit is not a verified problem.

Deduplicate by official number and slug, then search metadata, old layouts and family definitions before creating folders. Preserve original catalog categories; do not exclude SQL, JavaScript, design, concurrency or paid problems using title-inferred tags.

## Full requirements card for every problem

Before implementation, write or complete `docs/requirements/<id>.json` with:

- Official identity, URL, access/source type, checked date and whether the source is complete enough to implement.
- A faithful paraphrase of the objective, inputs/outputs, allowed operations, ordering, tie rules, strict/non-strict comparisons, modulo, impossible/empty cases and special guarantees.
- Official bounds for every field and number representation needs (including overflow/precision); distinguish visual limits explicitly.
- Sourced example input/output pairs, with enough reasoning to explain them. Add authored edge cases labelled as authored, not official.
- Category-specific semantics: tree/list serialization, class operation lifecycle, SQL schema/nulls/duplicates/order, asynchronous timing rules, concurrency guarantees, or nondeterministic valid-answer conditions.
- Unresolved ambiguities and the source needed to resolve them. Never infer a rule from the title or model recollection.

Prefer an accessible official page. If direct HTTP returns 403, try available web-reading/search tools or an ordinary authorized browser. Check local requirement records before fetching again. A complete permitted secondary explanation can support work if provenance and confidence are clear; a search snippet that omits bounds or tie rules cannot certify those details. Preserve disagreements and seek an authoritative resolution. Do not bypass paywalls, invent paid statements or request the user paste thousands of statements. Record the exact missing source/access requirement for genuinely blocked IDs, then continue other work. Avoid repeated identical failing requests: change the available route or defer that ID.

Regenerate the source directory with `node scripts/build-statement-source-index.mjs` after source-note changes. Its generated links are discovery metadata, not verification evidence.

## Implementation and educational requirements

Each standard algorithm entry needs `meta.js`, `index.jsx`, `algorithm.js`, `algorithm.test.mjs`, plus its requirement record. Provide `parseInput`, deterministic `buildTrace`, genuine language-neutral `code`, and complete executable `python`, wired into the shared workspace. Check the repository's current adapter/export contracts before editing. Preserve compatible existing exports/imports and useful examples. Do not rename an export without checking consumers.

Implement an algorithm appropriate to **official** constraints. A tiny brute-force visualization is not the full solution; use brute force as an independent small-case oracle. Separate unrestricted solver logic from bounded trace generation where necessary. Label limits and reject excessive visual input clearly; do not alter the mathematical domain (3880's zero exclusion is not a visual cap). Document solver time/space separately from trace snapshot cost and rendering limits. Validate JS integer precision and Python/JS agreement where relevant.

Every visual must answer: **what state exists now, what operation happens next, which dependencies justify it, what changed, and why does the final state prove the result?**

- Show the real algorithm's state and causal dependencies, not decorative motion or an output counter alone.
- Each frame must snapshot everything needed for rendering and narration; back/seek must not depend on future frames or mutable shared objects. Retain the final answer and meaningful witness/summary.
- Keep active item, source, destination, processed/unprocessed, candidate and best distinct, with textual labels as well as color. Keep important states visible on long inputs through appropriate windowing.
- Narration, pseudocode and Python highlights must describe the same operation and actual mutation. Validate every emitted line reference; substring lookups returning zero must fail fast. Range checks alone cannot establish semantic correctness.
- Do not leak future computed states into an earlier frame. Input facts can remain visible, but distinguish them from values discovered so far.
- Include a normal case, a boundary case and a case exposing the key insight. Pick understandable examples, not only trivial one-step success cases.

| Family | Minimum meaningful visual |
| --- | --- |
| Scans / two pointers / sliding windows | Indexed data, boundary/cursor positions, invariant, entering/leaving elements, current versus best window |
| Sorting / greedy / intervals | Actual ordering or priority, candidate decision, accepted/rejected items and the reason/invariant |
| DP | State definition, active destination, contributing source states, transition arithmetic and retained/reconstructed answer |
| Graph / shortest path / union-find | Nodes/edges, frontier/queue or heap, visited/distances/parents, actual relax/merge operation and path/result |
| Trees / linked lists | Stable node identity, actual pointer links, traversal/call stack, before/after mutation and returned subtree/value |
| Backtracking | Choice tree or stack, current partial solution, constraint/prune reason and explicit undo |
| Counting / math / optimization | Counts/groups, relevant bounds or candidate comparison, calculation and a visual explanation of the proof |
| Data-structure design | Operation stream, internal structure, returned values, invariant and state across operations |
| Strings / parsing | Token/character positions, matching/parser state, stack or lookup dependency and accumulated output |
| SQL | Example source tables, intermediate relation steps, joins/grouping/null/duplicate behavior and final result table; actual SQL remains primary |
| JavaScript / async / concurrency | Timeline/event queue or thread states, scheduling assumptions, shared state and permitted outcomes; do not falsely promise one universal interleaving |

For category exceptions, document an appropriate runnable/testable language and visual rather than manufacturing an irrelevant Python substitute. Keep the exception visible in completion accounting. A shared family view is acceptable only when it exposes that problem's actual states and decisions.

## Gates required before marking a problem complete

1. Requirements are sufficient and provenance is recorded; unresolved mathematical rules are not hidden.
2. Implementation, metadata and unique route exist and use the intended shared contract; no empty placeholder or duplicate legacy route.
3. Official examples and meaningful edge/adversarial cases pass. Independent exhaustive/random small-case oracle or property checks cover the actual risk; do not copy the optimized solver into its oracle. Four tests are not a quota that guarantees correctness.
4. Python is executable and agrees with the solution on representative and boundary cases. Check alternate valid outputs by validity/optimality, not arbitrary sample equality (for example balanced trees in 108/109).
5. Pseudocode is genuinely language-neutral; every phase/branch's highlighting is valid and semantically correct in each supported language.
6. Every actual routed preset parses and runs. Frame invariants, snapshots, narration, dependency visibility and final state are checked. Include branches not reached by the presets.
7. Browser acceptance loads the real route and waits for the correct panel; checks play/pause, step/back, seek, restart, speed, language switches, presets, custom input and validation errors. Inspect a meaningful intermediate decision and completion, plus narrow-screen usability and console/runtime failures. Do not count a stale prior route or loading skeleton.
8. Relevant integration tests and production build pass for the batch. Shared-component changes require regression coverage across affected families. A build is not browser acceptance.
9. Scoped diff is reviewed, unrelated work preserved, and the completed batch committed with accurate evidence. Manifest reflects the true gates, not just a commit.

If browser tools are unavailable, record browser acceptance pending and continue source/implementation/tests for other entries. Do not promote pending items to verified. Similarly, do not stop all work for one source, one failing problem or one unavailable category runtime.

## Continuous execution order

1. Inspect current status and reconcile the ledger. Fix 3880's official-domain/default error and line-zero failures in 3789/3800/3838/3880; implement the review's missing teaching state. Validate all nine recent entries.
2. Reconcile the held 12 folders non-destructively, including 2498's failures. Test expectations themselves need verification against requirements.
3. Close the original 17 partials and 56-entry acceptance queue from the historical handoff; recheck which gates are already complete before repeating work.
4. Work source-ready missing entries and convert legacy entries continuously, in manageable batches (roughly 5–10 depending on complexity). Source discovery is another queue, not a prerequisite that freezes all implementation. Prioritize correctness and reusable family improvements without flattening distinct algorithms into generic traces.
5. After each batch, record IDs, source provenance, checks, failures, browser evidence, commits and next ready IDs. Recompute remaining work from the ledger. Immediately take the next executable batch; do not end with “tell me if you want me to continue.”
6. At context/tool limits, save a checkpoint containing current revision/dirty files, completed work, exact failing commands/inputs, pending gates, next IDs and required next action. Resume from that checkpoint without asking the user to reconstruct the history. Do not mark interrupted work complete.
7. Once no executable item remains, report exact externally blocked IDs and the minimum missing access/information. A blocker is legitimate only after checking available sources and independent queues. Ask narrowly for the missing capability when necessary; do not repeatedly ask for scope already authorized.

Do not introduce deployment, publication, destructive cleanup or blanket restoration into this work. Scoped local implementation and commits are authorized; preserve unrelated work. Do not claim “all solved” while any known entry has a missing gate. Final reporting must reconcile the dated catalog, newly discovered entries, all verification statuses and any unavoidable external blockers. If even one entry is blocked, say the catalog is incomplete.

## First commands and deliverables

```sh
git status --short
git log -10 --oneline
node scripts/review-latest-visualizer-traces.mjs
node --test src/problems/Problem{3785,3788,3789,3797,3800,3818,3838,3842,3880}/algorithm.test.mjs
```

The trace audit currently exits nonzero by design because it reproduces open defects; it is not a gate to delete. Read the review before repairing. After changes, run affected tests, actual browser acceptance, `npm run build` and `git diff --check`; record which checks really ran. Preserve baseline evidence and store new results with their revision. Deliver working visualizers and honest per-ID evidence, not only another plan.
