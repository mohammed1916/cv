# Browser smoke results — 2026-10-29

Driver: `scripts/browser-smoke/accept.mjs` (Chrome 156 headless over DevTools, dev server `127.0.0.1:3010`). Each route: opens the page, reads the step counter, steps Next then Prev, seeks to the final frame, resets, switches Python and Pseudocode, loads every example button.

| Problem | Routes | Steps (start→next→prev→last→reset) | Examples loaded | Errors |
| --- | --- | --- | --- | --- |
| 139 | word-break | 1→2→1→270→1 | 5 | none |
| 140 | word-break-ii | 1→2→1→77→1 | 4 | none |
| 141 | linked-list-cycle | 1→2→1→22→1 | 5 | none |
| 142 | linked-list-cycle-ii | 1→2→1→39→1 | 5 | none |
| 432 | all-oone-data-structure | 1→2→1→14→1 | 3 | none |
| 3894 | traffic-signal-color | 1→2→1→5→1 | 8 | none |
| 3895 | count-digit-appearances | 1→2→1→40→1 | 4 | none |
| 3896 | minimum-operations-to-transform-array-into-alternating-prime | 1→2→1→32→1 | 5 | none |
| 3899 | angles-of-a-triangle | 1→2→1→6→1 | 5 | none |
| 3905 | multi-source-flood-fill | 1→2→1→6→1 | 4 | none |
| 3908 | valid-digit-number | 1→2→1→8→1 | 5 | none |
| 3909 | compare-sums-of-bitonic-parts | 1→2→1→17→1 | 5 | none |
| 3910 | count-connected-subgraphs-with-even-node-sum | 1→2→1→1683→1 | 4 | none |
| 3912 | valid-elements-in-an-array | 1→2→1→32→1 | 4 | none |
| 3913 | sort-vowels-by-frequency | 1→2→1→36→1 | 4 | none |
| 3914 | minimum-operations-to-make-array-non-decreasing | 1→2→1→18→1 | 5 | none |
| 3915 | maximum-sum-of-alternating-subsequence-with-distance-at-least-k | 1→2→1→32→1 | 5 | none |

## What this does not establish

- Only the first two frames, the final frame, and the reset state were checked. Intermediate frames, play/pause, and speed were not.
- Each example was loaded and inspected only for an error and its step count; its outputs were not compared with the expected results on each frame.
- Language switching was checked by searching the page text for a marker. The pseudocode marker can also match the reasoning panel, so it does not prove the code panel switched.
- Invalid input was tested on 139 only. Uppercase input was accepted (normalized), not rejected.
- No narrow/mobile layout, screenshot review, or maximum-size input was checked.
- Status: all 17 remain `partial`. Smoke results are evidence, not verification.
