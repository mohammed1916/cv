# Checkpoint: 2026-11-03

Records what this session verified and what remains. Nothing here claims full completion.

## Done and committed this session

- Sign-in: Google only, centered (`971e4aeee`).
- Nine-review priority-1 fixes (`0abe56792`): 3880 zeros and official-domain fix; line mapping in 3789, 3800, 3838. All 25 routed presets pass the trace audit.
- Held work (12 folders, 2357–2498) committed after comparison (`8e8c6fa97`); 2498 oracle and lookup fixed.
- Nine-review visual redesigns for 3785, 3788, 3789, 3797, 3800, 3818, 3838, 3842, 3880 (`29c5a4b77` … `26ec20296`).
- Pilot bespoke visual for 417 (`fa539b5a`).
- Draft-driven bespoke visuals: about 106 new problems across ten slices (`9f25c3c9` … `3ea5e146`, `f55d4455`, `6be9c275`, `301d4a31`, `c1d95c0f` and others). Each has tests and a passing build.
- Website content rule, presets: copied LeetCode example inputs replaced in 36 flagged folders (batches A–D: `c4451ecc`, `447b47b1`, `3c8e2099`, `40f001c4`), plus the six sourced problems (`692cec9c`).
- Website content rule, prose: 485, 559, 2478 sentences rewritten; 966 and 1172 example inputs replaced (`9aabe555`).

## Verified

- Node tests pass for every folder with a test file that was touched.
- `npm run build` passes at each commit.
- The trace audit (`scripts/review-latest-visualizer-traces.mjs`) passes for the nine-review set. It cannot read legacy story folders with no literal presets, so those were not audited this way.

## Not verified

- Browser acceptance for any changed view. No browser automation was available.
- The copied-prose scan is heuristic: 12-word runs of at least eight alphabetic words, against the recovered statements. Paraphrased copying is not caught.
- Drafts used as sources are model-authored. Their rules are not verified against official statements.

## Remaining work

1. Rule-gap drafts: 321 entries in `local-reference/leetcode/INBOX-STATUS.md` are `draft-explicit-rule-gap`. None of them has recovered archive text, so their rules cannot be verified offline. They need statement text from an authorized source, or the user's own paste.
2. Legacy conversion: about 1,400 folders still use the older story layout (no `algorithm.js` or `algorithm.test.mjs`). They are in scope under the completion contract. Several partial folders need completing first (616, 625, 634, 651).
3. Folder 505 contains files named for another problem (DistributeCandiesPeopleVisualizer). Check it before any conversion.
4. Narration, hints, story scenes and screenshots in legacy visualizers still need the website-content audit.
5. Browser acceptance for every changed visual.
6. Problem 2534 follows the draft rule, and its official example output is unverified.
7. Uncommitted requirement JSON from another session (`docs/requirements/3764.json`, `3793.json`, `3808.json`, `3832.json`, `drafts/known-problems.json`) is not part of this session's work and was left as found.

## Resume from here

Start with the completion contract (`docs/CATALOG-COMPLETION-CONTRACT.md`), then this checkpoint. Run `node scripts/review-latest-visualizer-traces.mjs <N>` before changing any preset.
