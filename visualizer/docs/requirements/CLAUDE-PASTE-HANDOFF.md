# Claude continuation: statement inbox and completion scope

## User instruction

The user wants every catalogue problem implemented and no longer requires visual polish as a condition for finishing. Prioritize functional coverage over animation polish. This does not permit fabricated rules, incorrect results, empty placeholder solutions, or false claims of verification. The current Codex task creates the statement-paste inbox only; no implementation or testing work is performed by this handoff.

## Read these sources

1. `local-reference/leetcode/user-pastes-326/<ID>.txt`: new user-paste inbox. Read all nonempty files; preserve them unchanged. Its README lists every ID and official page link. Process partial submissions immediately.
2. Existing recovered `local-reference/leetcode/raw/` statements and numbered `local-reference/leetcode/manual/` drafts. An absent raw statement does not make an existing draft useless.
3. `docs/requirements/CLAUDE-ANSWERS.md` and its 19 linked requirement records. Those questions already have clarifications, with official versus community confidence recorded.

All 326 section-3 IDs have paste slots. This is a convenience for obtaining exact source text, NOT a claim that the user must paste 326 pages before work can continue. Use reliable knowledge to write independently worded drafts for familiar tasks; label knowledge-derived material honestly. Do not claim remembered bounds, schemas, or API details are officially confirmed. Request a paste only for exact remaining uncertainty after reading available material. A source gap blocks that ID, not the whole queue.

## What Claude needs to finish

For each unfinished ID, establish the task contract (inputs, outputs, operations, constraints, tie rules, and relevant API/schema details), then implement the appropriate solution and functional route/view. SQL, JavaScript API, Promise, concurrency and design-class tasks remain included. Simple tables, state snapshots, operation logs or timelines are acceptable; decorative animation is not required. Keep original website explanations and examples separate from pasted reference text.

Report implementation completion separately from requirement-source confidence and any checks actually performed. Do not make visual polish a blocker or spend time on unrelated cleanup. Never claim checks that did not run.

## Counts: do not confuse these

- 326 IDs are in the category-based statement-review list; this is not the total implementation backlog.
- 19 other specific questions were answered in CLAUDE-ANSWERS.md; 14 retain community rather than official confirmation.
- The on-disk catalogue manifest lists 4,073 entries and an older snapshot of 1,451 legacy + 17 partial + 1,189 missing = 2,657 unfinished entries. Subsequent commits mean that snapshot cannot supply the current remaining implementation count.
- Before announcing an exact completion backlog, reconcile the manifest with current folders/routes and actual implementations. Do not count empty folders or pasted statements as solved problems. Do not ask the user to reconcile it.

At a session limit, checkpoint completed IDs, remaining IDs, exact blockers and the next batch. Continue ready work without repeatedly asking permission to proceed.
