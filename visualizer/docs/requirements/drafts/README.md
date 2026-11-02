# Original problem requirements drafts

The user asked the assistant to fill known requirements instead of making the user transcribe every missing page. `known-problems.json` contains independently written descriptions from model knowledge. They are **not verified official statements**, not recovered full text, and not evidence that current numeric bounds or interface details are known. Explicit uncertain rules remain marked.

Run `python3 scripts/fill-known-statement-drafts.py` to fill empty numbered files in `local-reference/leetcode/manual/`. It uses an existing requirement note when available, otherwise the authored draft. It never overwrites non-empty user text. Run `python3 scripts/prepare-manual-statement-inbox.py` afterward to refresh text-present indicators.

Initial fill: 89 files written (84 knowledge drafts and five inherited source notes); one existing file, 175.txt, preserved. Total non-empty files after that fill: 90 of 1,089. That first checkpoint left 999 empty files; it is historical, not the current count. The historical raw archive's 2,984 full-statement count is unchanged.

Continuation: read existing full reference text, user pastes, authored drafts and source notes before fetching. Enrich drafts from legitimate accessible sources, independently check authored examples, and resolve API/tie/domain uncertainty. Do not certify requirements from titles, generic summaries or a solver's behavior alone. Do not fill unknown problems with placeholder prose merely to make an empty-file count reach zero. Ask the user only for specific genuinely unresolved information after available work has been done.

The four official pages checked during this fill (156, 157, 161, 163) displayed a Premium gate through the web-reading tool. Their drafts therefore remain explicitly knowledge-based. No exact official numeric constraints were asserted on that basis.

Website content still requires independent authorship and validation; this reference workflow does not automatically publish any text or examples.

## Continued fill checkpoint — 2026-11-02

The next pass added **430 files**: 427 additional knowledge-based drafts and three newly sourced requirement notes (4039, 4040, 4043). Current inbox: **520 non-empty / 569 empty** out of 1,089. The non-empty files contain 511 knowledge drafts, eight inherited/new source-note renderings and one preserved supplied text (175.txt). This is text coverage, not 520 verified complete requirements.

Run `python3 scripts/audit-manual-statement-inbox.py` for [the local per-ID status report](../../../local-reference/leetcode/INBOX-STATUS.md). Automated triage currently distinguishes 332 drafts awaiting source verification and 179 drafts with explicit caveats/rule gaps; these are conservative text-based labels, not a human completeness audit. All remembered numeric bounds remain unverified unless separately sourced.

The official pages for 4039, 4040 and 4043 were readable via the web tool. Their independent notes contain source-checked constraints and newly authored examples; no official example was copied into a website preset. Individual attempts for 4041, 4042, 4071, 4072 and 4073 failed through that tool. These failures are route-specific, not proof of permanent inaccessibility. Continue with available sources and other entries.

Next work is to resolve the explicit rule gaps (especially hidden interfaces, JavaScript timing and SQL schemas), continue drafting known empty entries and source unknown ones. Never infer a complete problem from a title, mark an explicitly incomplete draft as ready, or make the user transcribe the full remainder. Some descriptions deliberately identify the missing rule rather than inventing it; they remain open.
