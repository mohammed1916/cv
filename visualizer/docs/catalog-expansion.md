# Full catalog expansion status

This work is **not complete for all LeetCode problems**.

The public `https://leetcode.com/api/problems/all/` endpoint returned 4,073
entries on 2026-10-05. The earlier refresh script requested only the algorithms
category; it now requests the complete catalog, including database problems.

After the continued implementation there are 696 local routes, of which 680 match catalog slugs
or unique normalized titles. **3,393 catalog entries remain unmatched.** Route
presence does not certify every old implementation. See `catalog-coverage.json`
for the complete per-problem inventory, legacy number differences, and unmatched
local routes. Run `npm run audit:catalog` to regenerate it.

## Added in this batch

### Continued implementation: 55 additional problems

594, 598, 599, 606, 617, 623, 637, 646, 653, 654, 657, 658, 661, 665,
669, 670, 671, 673, 678, 680, 682, 686, 687, 692, 693, 696, 700, 701,
709, 713, 714, 717, 718, 728, 733, 735, 738, 740, 744, 771, 796, 804,
806, 821, 830, 836, 844, 849, 852, 856, 859, 872, 897, 938, and 965.

These add 220 project-authored examples, 40 explicit scan/DP/string/grid
algorithms and 15 explicit tree algorithms. Trees reuse `TreeDiagram`,
`binaryTreeLayout`, and `SvgViewport`; every route reuses `AlgorithmWorkspace`
and the shared story, input, code, docking, and playback components.

Registration is repeatable with `npm run build:authored-routes`. It only
registers explicit implementations and refuses to replace unrelated folders.

### Earlier 24-problem addition

605, 611, 628, 633, 643, 645, 674, 697, 724, 747, 766, 832, 867, 896,
905, 922, 977, 1047, 1207, 1295, 1431, 1480, 1512, and 1672.

Each has its own algorithm, validation, teaching pseudocode, narrative, and
named boundary examples. The shared workspace owns input editing, examples,
docking, playback, speed, timeline, code highlighting, and phase navigation.
The shared scene renders the algorithm's actual pointers, windows, accumulators,
frequency tables, stack, or source/destination matrix cells. Trace snapshots
are immutable so stepping backward cannot reveal later mutations.

The 99 new example inputs, labels, explanations, and implementations were
authored for this project. Official problem titles, slugs, and links identify
the underlying exercises. No official example table or editorial text was
copied into these new definitions. Small boundary inputs can naturally coincide
with other examples; provenance does not imply mathematical uniqueness.

## Current validation

- Combined family tests: 93 passing tests, including 7,900 deterministic
  generated-input oracle comparisons across 79 algorithms (5,500 added in
  this continuation).
- 2,571 real scene frames render successfully on the server, including tree
  diagrams with stable IDs and independent snapshots across rewiring.
- 12 authored-example tests and 704 narrative tests pass.
- Catalog example audit covers 696 routes and executes 1,726 legacy traces
  and 524 shared-workspace builds. 332 legacy helper/adapter checks remain
  explicitly skipped.
- Production build passes and changed-source lint introduces no new findings.
- Browser layout, clicking, timer playback, and responsive behavior remain
  unverified in this continuation. Server rendering is not a substitute for
  browser interaction testing.

## Earlier validation record

- 30 algorithm and catalog-identity tests pass, including 2,400 generated
  small-input comparisons against independent reference implementations.
- All 99 new examples run through their actual parsers/builders.
- All 786 example frames render through the real shared scene on the server.
- Authored-example contracts: 12 passing tests; narratives: 649 passing tests.
- Catalog example audit: 641 routes, 1,726 legacy trace checks, 304 workspace
  builds. 332 legacy helper/adapter checks remain explicitly skipped.
- Production build passes; changed-source lint introduces no new findings.
- No browser was available. Layout, clicking, timer playback, and responsive
  behavior have not been verified in a browser during this batch.

Visualization input limits are stated in validation errors. Algorithm time and
space descriptions exclude the additional storage used for replay snapshots.

## Completion rule for subsequent work

A catalog listing or empty shared shell is not a completed visualizer. Each
remaining problem needs verified requirements, original examples, an actual
algorithm trace and appropriate scene, explanatory narrative, domain validation,
independent algorithm tests, and interaction checks. Shared semantic families
can reduce duplication without marking unimplemented algorithms as complete.
