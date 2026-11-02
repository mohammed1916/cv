# Latest nine visualizers: review and required repairs

Reviewed 2026-11-02 against `cff33e863`. Scope: 3785, 3788, 3789, 3797, 3800, 3818, 3838, 3842, 3880. This is source inspection, solver tests and execution of actual authored presets/frame contracts. **No browser playback acceptance was performed in this review.** No implementation was repaired by this review.

All nine problems have useful visual teaching opportunities. They do not all need elaborate animation. They do need visible algorithm state, a visible reason for each decision, and a retained result/witness. A changing scalar beside an unchanged input is insufficient when the essential dependency or decision is hidden.

## Reproduced failures: fix before expanding these patterns

The nine algorithm test files pass **38/38 tests**, but the actual `definition.examples` audit finds **9 failing presets out of 25**. This is evidence that the current tests do not certify the routed teaching experience.

| Priority | Problem | Reproduction and consequence | Required repair |
| --- | --- | --- | --- |
| P1 | 3880 | Default preset `[1,2,3,2]` throws in `parseInput`. `AlgorithmWorkspace` initializes the first preset during mount. Static inspection therefore predicts route initialization failure; this has not been observed in a browser here. | Replace invalid default with a sourced example and execute every routed preset in tests. |
| P1 | 3880 | Official values include **0, 1, 2**, but parser/UI say only 1 or 2. JS and Python also treat any non-1 as the other type when pairing. Valid zeros must be ignored, not paired. | Correct parser, solver, Python, pseudocode, labels, examples and tests together. Preserve official length bound 100 separately from visual cap 20. Add zero-only, missing-type, interspersed-zero and nearest-pair cases. |
| P1 | 3789 | All three presets emit split frames with `activeLine: 0`; lookup text `only2 is max` does not match pseudocode. | Use checked explicit event-to-line mapping and verify semantics, not only range. |
| P1 | 3800 | All three presets emit invalid lines, including start/costs. | Audit every emitted phase and both language mappings. |
| P1 | 3838 | Both presets emit start line 0: `start an empty result` differs from `start with an empty result`. | Correct mapping; make missing mappings fail during development/tests. |
| P1 | 3880 | Even valid `[1,2]` emits pair line 0: `if the other value` does not exist in pseudocode. | Cover branch frames after correcting the input domain. |

The official [3880 description](https://leetcode.com/problems/minimum-absolute-difference-between-two-values/description/) was readable through the web tool on this review date. It defines the minimum index distance between a 1 and a 2, or -1 if either type is absent. Examples include `[1,0,0,2,0,1] → 2` and `[1,0,1,0] → -1`. See [corrected requirement note](../requirements/3880.json). The prior 403 experience is not proof that every official page is unavailable.

Reproduce from repository root:

```sh
node --test src/problems/Problem{3785,3788,3789,3797,3800,3818,3838,3842,3880}/algorithm.test.mjs
node scripts/review-latest-visualizer-traces.mjs
node scripts/review-latest-visualizer-traces.mjs 3880
```

The audit is intentionally failing against the reviewed baseline. It checks literal routed presets and line ranges, not all possible input branches, semantic line correctness or browser behavior. Keep the [baseline JSON evidence](evidence/2026-11-02-latest-traces.json) immutable; record later results separately. Do not suppress failures, loosen assertions or rewrite examples merely to avoid a legitimate algorithm branch.

## Required visual design per problem

### 3785 — minimum swaps avoiding forbidden values

Current: aligned sequences, a current-position conflict, and scalar counts. Missing: persistent conflict groups and the feasibility/counting proof.

Show aligned `nums`/`forbidden` positions with persistent conflict marks; a combined frequency histogram with capacity `n`; grouped bad positions by value; and both lower bounds `ceil(bad / 2)` and the largest bad group. Highlight which bound determines the answer and which capacity violation proves impossibility. For small cases a separate validated swap witness can explain attainability, but do not pretend the counting solver performs those swaps. Retain before/after and swap count if presenting a witness. Acceptance must include no conflicts, impossible capacity, balanced conflicts and a dominant group.

### 3788 — maximum split score

Current prefix/suffix role labels and scalar score provide a useful base. Make the suffix-minimum dependency explicit: add a suffix-min row filled right-to-left, its source index, a visible split boundary, prefix sum and `prefix - suffix minimum` calculation. Preserve the best split and its two contributing values at completion. With `[10,-1,3,-4,-5]`, show split index 2 and score 17. Include negative values and a best split that is not the last split; do not confuse the current candidate with the retained optimum.

### 3789 — minimum purchase cost

Current visual is only an output string (`both`, `total`, `best`); it does not show the optimization. Add a candidate table for combined counts `0`, `need1`, `need2`, containing single-item counts, coverage/excess, each cost contribution, total and best marker. Add two demand/coverage bars. Explain the piecewise-linear cost and why these breakpoints suffice. Persist the winning purchase plan rather than discarding it in the done frame. For costs `(3,2,1)` and needs `(3,2)`, show why buying three combined items is optimal despite excess coverage of the second need. Cover zero needs and expensive combined items.

### 3797 — grid path counting

Current merged-count grid hides the recurrence's two distinct states. Expose arrival counts separately from counts after optional sideways movement. Show the source interval, destination, blocked cells, contribution values and the vertical reach `floor(sqrt(d² - 1))` versus horizontal reach `d`. Exclude self from sideways additions and show why newly computed sideways counts cannot chain into another sideways move. Frames need snapshots of these arrays/windows, not just the final merged table. For a single row `['..']`, `d=1` gives four paths; for `['..','#.']`, compare `d=1 → 2` and `d=2 → 4`. Explain solver auxiliary space separately from storage used by full-grid trace snapshots.

### 3800 — minimum cost to equalize strings

Current static mismatch marks and A/B scalars hide both classification progress and operation alternatives. Visibly partition processed positions into A=`(0,1)` and B=`(1,0)`, distinguish unprocessed positions, show the pair costs `min(swap, 2*flip)` and `min(cross+swap, 2*flip)`, and show each tested mixed-pair count with residual groups, pairs, singles and total. Persist the winning breakdown. If animating an operation witness, verify every operation is legal, its total equals the optimum and its final strings match. Do not display future classification as though the scan has already computed it.

### 3818 — shortest removed prefix

The suffix scan is appropriate. Improve the explanation rather than replacing it: distinguish the retained suffix from the two currently compared values, mark the removal boundary, display the strict comparison and stopping violation, and label provisional removal counts as provisional. At completion, visibly separate removed prefix from retained suffix. Test already increasing, descending, equality at the boundary and a one-element array.

### 3838 — weighted word mapping

Show the input letter-weight lookup with the active weight, the accumulated sum equation, modulo 26 and the reverse alphabet mapping (`0 → z`, `25 → a`). Snapshot the progressively built output and retain it at completion. The current visual only shows the word and total; it resets the displayed total at done and does not render the constructed result in its visual panel. Test multiple words and residues 0 and 25. The final visual should let a learner reconstruct the output without relying exclusively on narration.

### 3842 — toggle bulbs

The current event sequence and comma-separated set are a base, not a finished state diagram. Render the distinct bulb IDs with explicit on/off labels, highlight the next toggle and show its before/after state. Display the event cursor and optionally per-ID parity. Two events for the same bulb must visibly turn it on then off. Preserve the sorted final lit set. Use labels/icons as well as color; a simple bulb grid is enough.

### 3880 — nearest 1/2 index distance

First fix the domain/default defects above. Add last-seen index state for both values, visibly skip zeros, connect the current position to the nearest previous opposite value, show the index subtraction, and retain the best pair endpoints. The current `remember` narration has no last-seen state in its frame payload. On `[1,0,0,2,0,1]`, show candidate distances 3 then 2; on `[0,0]`, show no candidate and -1. Use an independent all-pairs oracle for small arrays over `{0,1,2}`.

## Acceptance of these repairs

For every problem: tests against sourced rules; independent small-case oracle where appropriate; actual presets execute; emitted frames contain the state required by the visual; line references match the operation in both languages; final answer/witness remains visible; restart/back/seek reproduce the same state; and the actual routed panel is exercised in a browser. Record screenshots or specific visible assertions at a decision frame and the final frame. Do not label this review, the existing 38 tests, or a production build as completed browser acceptance.
