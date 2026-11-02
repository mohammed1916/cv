# Original problem requirements drafts

The user asked the assistant to fill known requirements instead of making the user transcribe every missing page. `known-problems.json` contains independently written descriptions from model knowledge. They are **not verified official statements**, not recovered full text, and not evidence that current numeric bounds or interface details are known. Explicit uncertain rules remain marked.

Run `python3 scripts/fill-known-statement-drafts.py` to fill empty numbered files in `local-reference/leetcode/manual/`. It uses an existing requirement note when available, otherwise the authored draft. It never overwrites non-empty user text. Run `python3 scripts/prepare-manual-statement-inbox.py` afterward to refresh text-present indicators.

Initial fill: 89 files written (84 knowledge drafts and five inherited source notes); one existing file, 175.txt, preserved. Total non-empty files after that fill: 90 of 1,089. The 999 remaining empty files are unresolved work, not automatically a request for the user to supply them. The historical raw archive's 2,984 full-statement count is unchanged.

Continuation: read existing full reference text, user pastes, authored drafts and source notes before fetching. Enrich drafts from legitimate accessible sources, independently check authored examples, and resolve API/tie/domain uncertainty. Do not certify requirements from titles, generic summaries or a solver's behavior alone. Do not fill unknown problems with placeholder prose merely to make an empty-file count reach zero. Ask the user only for specific genuinely unresolved information after available work has been done.

The four official pages checked during this fill (156, 157, 161, 163) displayed a Premium gate through the web-reading tool. Their drafts therefore remain explicitly knowledge-based. No exact official numeric constraints were asserted on that basis.

Website content still requires independent authorship and validation; this reference workflow does not automatically publish any text or examples.
