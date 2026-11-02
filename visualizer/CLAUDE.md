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
