# Recent-commit review for Claude — 2026-10-27

Review baseline: `31acf774170e409104e7603e218d1f6d70343a6d`. This is a spot-check, not an exhaustive audit. Reviewed portions of `31acf7741` (shared state views), `ec6474289` (union-find), and `e1e617c89` (120 new visualizers). Sampled standalone problems 736, 753, 805, 847, 913, 943, and 958, plus shared-model integrations. No application fixes were made.

## 1. P2 — DP window can exclude the cell being computed

Status: open. Introduced in `31acf7741`.

Location: `src/components/shared/dpDependencyModel.js:81–83`.

The window starts near the lowest source coordinate even when the target is farther away than the window width. Thus the table described as a window around the active cell can omit that cell entirely.

Reproduced through problem 1043's real parser and trace builder with `{ "arr": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], "k": 24 }`. The final DP transition targets cell 24, but `dpWindow(frame.dpDeps)` returns columns `[0,14)`. The active cell and its highlight are absent from the table, although the textual explanation still exists.

Fix criteria: always include the target in the visible row/column bounds. Include sources when space permits; clearly indicate sources outside the window. Add a regression for distant sources, including interval DP and this 1-D example. Existing adjacent-source window tests do not cover this case.

## 2. P2 — Union-find narration falsely claims full compression

Status: open. Introduced in `ec6474289`.

Locations: `src/components/shared/disjointSetModel.js:6–7` and `src/problems/families/collectionStories/authoredUnionFind.js:8–14`.

The solver uses path halving, but the description says every changed node points straight to the root. On deeper trees, a changed node can instead point to an intermediate ancestor. This teaches a different operation from the actual parent array and forest.

Reproduction: create `AuthoredUnionFind(8)`; union pairs `[0,1], [2,3], [4,5], [6,7], [0,2], [4,6], [0,4]`; drain operations; call `find(7)`. The recorded chain is `7 → 6 → 4 → 0`, and the resulting `parent[7]` is **4**. `describeDisjointSetOps()` nevertheless says “re-points 7 straight to 0.”

Fix criteria: record and describe actual before/after parents for halving, or deliberately change the algorithm and displayed teaching code to full compression. Test a depth-three chain and assert that the narration agrees with the snapshot.

## 3. P2 — Stack integration test fails: 901 and 946 emit no stack view

Status: open. The integration expectation was added in `31acf7741`; these base solvers were not migrated.

Locations: `src/components/shared/stackqModel.test.mjs:50–58`; `src/problems/families/collectionStories/algorithms.js:88–89,142–143`.

Running the new shared-model tests fails with `901 has no stackq frames`. Independently inspecting both definitions' first examples confirms 901 produces 12 frames and 946 produces 14 frames, with zero `stackq` payloads in either. The test stops at 901, hiding the second missing integration. By comparison, 1438, 1696, and 2454 do emit the payload.

Fix criteria: migrate the intended base solvers to `StackqLog`/`stackqView`, preserving their results and logging push/pop actions. Check the actual routed visualizers as well as family definitions; family coverage alone does not establish route coverage. Edit `algorithms.js`, then regenerate `baseAlgorithms.js` with `npm run build:definition-groups` (it is generated). Verify that the generator preserves any new helper imports before relying on generated output. Run every integration case independently so one failure does not conceal another.

## Verification evidence

- `node --test src/components/shared/*Model.test.mjs`: **77 passed, 1 failed**, the stack integration failure above.
- `node --test src/problems/Problem{736,753,805,847,913,943,958}/algorithm.test.mjs`: **22 passed**.
- Additional direct Node probes reproduced the DP window and union-find narration mismatches, and checked stack payload counts.
- No browser rendering or full production build was performed. Passing solver tests do not establish visual correctness.
- Local Git commands repeatedly warn about non-monotonic indexes for `.git/objects/pack/._pack-*.idx`; history remains readable. Treat this as a separate repository-maintenance observation, not a commit regression. No Git metadata was modified.

## Keep in mind for subsequent changes

Validate teaching state, narration, and active highlights alongside final algorithm results. Exercise non-adjacent DP dependencies and deeper union-find trees. When announcing a shared-view migration, verify its payload in actual solver frames and its rendering in the routed page. Keep generated files synchronized with their source and run the newly added test suites explicitly.
