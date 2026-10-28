# Catalog partial repair checkpoint — 2026-10-28

Complete continuation instructions: [Claude catalog handoff](../CLAUDE-CATALOG-HANDOFF.md).

Baseline: ec8513287. This checkpoint repairs language contracts across all 17 partial entries; it does not complete the catalog expansion. No legacy or missing entry was converted. Changes are uncommitted.

## Changes

- 139–142: retain their authored scenes, add standard parseInput/buildTrace/code/python exports, replace Python-labeled-as-pseudocode with explicitly authored pseudocode preserving line positions. Existing Python source assertions now test the Python export.
- Their shared AlgorithmStoryWorkspace exposes language selection when Python is supplied. Other story definitions retain their existing panel. Executable playground handoff stays disabled when the story does not supply normalized input.
- 3894, 3895, 3896, 3899, 3905, 3908, 3909, 3910, 3912–3915: separate complete Python from pseudocode and wire Python into their workspace definitions. Preserve pseudocode line positions.
- 432: standard parser and trace exports, complete linked-bucket Python class, honest visualization cap of 200 operations, and AlgorithmWorkspace route with key-count table. The legacy module remains available, with CODE aliased to corrected pseudocode.
- New independent checks: exhaustive direct-comparison oracle for 3912, vowel sorting/consonant invariants for 3913, shortest-path subarray-increment oracle for small 3914 arrays, independent count-map oracle for 432.
- Official pages were accessible through the web tool for every partial entry. `docs/requirements/<number>.json` records paraphrased requirements, source URLs, constraints and visualization caveats. 3913's first-occurrence tie rule is confirmed; 432 and 3912 no longer have sourcing blockers.

## Verification

130 tests passed:

```sh
node --test src/problems/catalogPartialRepairs.test.mjs src/problems/Problem{139,140,141,142,432,3894,3895,3896,3899,3905,3908,3909,3910,3912,3913,3914,3915}/algorithm.test.mjs src/problems/recentVisualizers.test.mjs src/components/shared/resolveNarrative.test.mjs
```

The contract suite checks all 17 standard exports, executes each Python solution on a representative input and compares it with the JavaScript result, checks Python syntax, and checks all active/related line references for those traces. This does not prove semantic correctness of every highlighted intermediate line.

`npm run build` passed after the final shared-workspace change (17.80 seconds), with large-chunk and Pyodide browser-externalization warnings. No generated definition changes were required.

Chrome smoke checks against the local Vite server:

| Routes | Checked |
| --- | --- |
| 139–142 | Python/pseudocode selection; forward and backward steps; active pseudocode line |
| 432 | Final frame; previous query frame with correct count and active line; Python/pseudocode selection |
| 3894–3896, 3899, 3905, 3908–3910, 3912, 3914–3915 | Seek to terminal frame, correct end-of-playback control state, switch to actual pseudocode, active line, step backward |
| 3913 | Complete phase, ranked vowel output, consonant preservation in displayed example, active pseudocode return line |

An initial fast navigation pass acted before route replacement settled; its language results were discarded. Checks were repeated after route-specific content loaded. These are smoke checks, not exhaustive playback, every-example checks, maximum-input stress tests, or screenshot-based visual acceptance.

## Outstanding gates and backlog

- Keep all 17 statuses partial: changes are not committed, 139–142 still use AlgorithmStoryWorkspace rather than the literal AlgorithmWorkspace template, and full browser acceptance is outstanding. The manifest has granular evidence without inflating its verified total.
- 140 accepts strings through length 25, beyond the official maximum 20. Bound its exponential trace size before broad input/browser acceptance. Review the other older parser domains; source notes record known mismatches.
- Review Python playground input adapters for the older story definitions before enabling executable handoff.
- The previous 38 repairs and 2919 still need browser coverage; this checkpoint did not certify them.
- 1451 legacy-unconverted and 1189 missing entries remain. Build problem-specific implementations and independent checks; do not classify copied shells as verified.
- Paid-only entries still require legitimately accessible statements. This checkpoint accessed only public official pages.
- Existing Git AppleDouble pack-index warnings remain; no Git metadata was modified.
