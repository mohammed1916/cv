# Readable problem requirements for Claude

Start with [INDEX.md](INDEX.md) or [index.json](index.json). Both cover all **4,073 entries in the repository's stored catalog**, including paid entries. This is not a claim that 4,073 is today's live LeetCode total.

## Full statements recovered locally

**The earlier inventory missed a deleted full-text archive.** See [recovery evidence](RECOVERY.md) and [the recovered statement directory](../../local-reference/leetcode/README.md). It now contains **2,984 non-empty historical full statements** from this repository. These are the actual stored HTML descriptions and example-testcase fields, not our short paraphrases. Prefer these local files before attempting a fetch.

Of 4,073 stored catalog entries, 304 free and 785 paid entries still lack full cached text. The empty archived record for 271 is counted as missing. Access labels are from the catalog snapshot, not live entitlement checks.

This directory's `INDEX.md`/`index.json` separately index **211 requirement summaries**, 147 attempt-only notes and 3,715 link-only records. Those figures describe the summary layer, not the recovered full-text layer. Some entries have both. Do not add the counts together or assume a link-only entry has no full local statement.

## Latest continuation

See [the next sourced batch and held-work comparison](../reviews/2026-11-02-claude-unblock.md). The five recent IDs below have since been implemented and committed; the next sourced IDs are 3017, 3020, 3030, 3139 and 3149. Counts above reflect this regenerated directory; use `index.json` after subsequent updates.

## Ready-to-read recent batch

These five formerly missing folders were absent when checked. Their official pages were successfully read on 2026-11-02 and their rules, official constraints, example inputs/outputs and pitfalls are now in:

- [3785 — Minimum Swaps to Avoid Forbidden Values](../requirements/3785.json)
- [3788 — Maximum Score of a Split](../requirements/3788.json)
- [3789 — Minimum Cost to Acquire Required Items](../requirements/3789.json)
- [3797 — Count Routes to Climb a Rectangular Grid](../requirements/3797.json)
- [3800 — Minimum Cost to Make Two Binary Strings Equal](../requirements/3800.json)

These files unblock requirements discovery; they do not certify any implementation. Recheck current route/folder state before assigning work.

## How to obtain the rest

1. Read an existing requirement note first, including its source kind, date and verification caveats. An `official-page-blocked` record with a null summary is not sufficient.
2. Open the entry's `officialStatement` URL with a web-reading/search tool. If direct WebFetch/curl gets 403, try the available web search/read tool or the normal browser. On 2026-11-02 the bulk `/api/problems/all/` curl request returned 403 while all five official pages above were readable through the web tool. Failure of one transport is not proof that the problem is unavailable.
3. If needed, search the exact canonical title with an official-domain restriction, then open the full result. A title, search snippet or remembered solution does not establish all requirements.
4. For paid problems, use authorized access if available. Do not bypass login, paywalls, CAPTCHAs or access restrictions. Public author explanations or legitimately accessible alternative sources may help only if they establish the complete rules; document provenance and discrepancies. Never label a community source as official.
5. Save a concise paraphrased requirement record under `docs/requirements/<number>.json`: identity, source URL, retrieval date, actual source kind, rules, official constraints, examples, tie rules, ambiguous details, visual caps separately, and verification status. Do not bulk copy editorials or fabricate a statement from its title.
6. When access genuinely fails, record attempted URLs, method, date, actual error and the missing information. Keep the problem in the queue. Continue accessible missing entries and all legacy conversion work instead of waiting for the user to paste thousands of statements.
7. Rebuild this index with `node scripts/build-statement-source-index.mjs`. This only writes the source directory; it does not change implementation statuses or overwrite problem code.

The scope remains **every LeetCode problem**, across difficulties, dates, free/paid access and categories such as database and JavaScript. The repository snapshot must eventually be refreshed/reconciled against the live catalog; do not silently omit entries because the snapshot or a worker's knowledge is old.

## First actions for continuation

Implement and verify the five sourced problems above using the existing handoff gates. In parallel workstreams, if available, source the remaining recent problems and process the legacy backlog. Each worker must receive actual requirements or be assigned explicit research work, not be expected to recall new problem rules. Do not repeatedly rebuild the same skipped queue without changing its source evidence.

The claimed 36 overwritten folders require reconciliation: at this check there were 36 modified tracked files across **12** problem folders, plus their untracked test files. This is not evidence of 36 currently overwritten folders. Preserve both working and committed versions, compare changes, and merge useful implementation/tests. Do not blanket-restore or delete held tests. Reversible preservation/comparison work does not need another permission request. If a genuinely destructive choice remains after review, identify exact paths and alternatives.
