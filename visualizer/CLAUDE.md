# Latest user direction: finish functional coverage; paste inbox available

Read [the paste inbox and completion handoff](docs/requirements/CLAUDE-PASTE-HANDOFF.md). The user accepts basic visual presentation and wants all problems finished. New statement copies go in `local-reference/leetcode/user-pastes-326/<ID>.txt`; its README links all 326 pages. Read nonempty files immediately and continue ready work without waiting for every paste. Earlier requirements-only instructions describe the previous task; visual polish is no longer a completion blocker. The current inbox-creation task itself does not change implementations.

# Current priority: requirements only — 2026-11-03

The user's latest instruction is to provide proper problem requirements and help Claude proceed, without unrelated tests, builds, browser checks, implementation changes or cleanup. Read [the answers and continuation](docs/requirements/CLAUDE-ANSWERS.md), then [the original questions](docs/requirements/CLAUDE-QUESTIONS.md). The 19 concrete questions have sourced clarifications; the 326 category-based rows still need individual draft review. Preserve source-confidence labels and user reference text. The implementation review below is deferred during this requirements task.

# Latest manual-run review — 2026-11-03

Read [the latest review and continuation](docs/reviews/2026-11-03-manual-run-review.md). The reviewed commit range contains 223 changed folders, 1,071 passing tests and 612 passing preset/line checks. Browser access works on port 3010; only targeted 3616 interactions were checked. Its selected-student identity bug is fixed. Duplicate catalogue React keys and full browser acceptance remain open. The five loose files were identical 3616 duplicates and are preserved outside src. SQL/API/Promise/concurrency/design work remains in scope.

# Assistant-owned requirement drafting

The user explicitly asked the assistant to fill missing requirement files itself. Use known algorithm knowledge for clearly labelled original drafts, then verify uncertain details; do not delegate the whole backlog to the user. Read [draft coverage and continuation](docs/requirements/drafts/README.md): all 1,089 numbered inbox files now contain text (569 added in the latest pass). These comprise 854 drafts, 234 source-note renderings and one preserved user paste; text presence is not verification. There are no empty files to ask the user to transcribe wholesale. Resolve the per-ID rule gaps and verification gates next. Run `python3 scripts/audit-manual-statement-inbox.py` for per-ID status. Never overwrite non-empty user pastes, and never count unverified drafts as recovered official statements.

# Website content rule — user instruction

**Do not publish LeetCode statement text or its examples on our website.** Cached material is for local reference. Use independently authored explanations, example inputs, walkthroughs, diagrams and narration. Audit existing presets as well as new work. Read [the reference/public-content boundary](docs/statement-sources/WEBSITE-CONTENT-RULES.md). This overrides older instructions to preserve examples when those examples were copied from LeetCode.

# Full statement archive recovered — read this first

The repository previously contained full statements. They were deleted in September, but **2,984 non-empty statements have now been recovered locally**. Read [recovery evidence and access instructions](docs/statement-sources/RECOVERY.md), then use [the local full-text index](local-reference/leetcode/README.md) before attempting web fetches. The summary index is not the complete inventory of locally available requirements.

# Current task: complete every LeetCode visualizer

Start with [the authoritative completion contract](docs/CATALOG-COMPLETION-CONTRACT.md). It defines full per-problem requirements, proper visual teaching, completion gates, continuous execution, source fallbacks, held-work preservation and session checkpoints. All legacy conversion, partial repair, missing implementations and browser acceptance are already in scope.

Then read [the latest nine-problem review](docs/reviews/2026-11-02-latest-visualization-review.md): 38 solver tests pass, but 9/25 routed presets fail parsing or frame-line checks. Problem 3880 has an official-domain error and an invalid default. The review provides concrete visual designs and acceptance cases for all nine; fix these issues before copying their patterns.

Read [source/held-work evidence](docs/reviews/2026-11-02-claude-unblock.md), [statement sourcing workflow](docs/statement-sources/README.md), and [the historical detailed handoff](docs/CLAUDE-CATALOG-HANDOFF.md) for prior repairs and the original acceptance queue. Historical counts and HEADs must be reconciled with current code. The new contract supersedes historical skip-tests or legacy-out-of-scope guidance.

Preserve the dirty working tree. The 36 held tracked files are in 12 folders, with 12 test files; compare and merge rather than blanket restore. A blocked source blocks that entry, not all work. Continue the next ready queue without repeatedly asking whether to proceed. At a session limit, checkpoint exact remaining work for resumption; never claim unrun verification or full completion.

Before modifying shared views, consult [the October 27 review](docs/reviews/2026-10-27-recent-commits.md) and retain its regression checks. Recheck old findings against current source rather than assuming they remain open.
