# Full catalog expansion status

This work is **not complete for all LeetCode problems**.

The public `https://leetcode.com/api/problems/all/` endpoint returned 4,073
entries on 2026-10-05. The earlier refresh script requested only the algorithms
category; it now requests the complete catalog, including database problems.

After this batch there are 641 local routes, of which 625 match catalog slugs
or unique normalized titles. **3,448 catalog entries remain unmatched.** Route
presence does not certify every old implementation. See `catalog-coverage.json`
for the complete per-problem inventory, legacy number differences, and unmatched
local routes. Run `npm run audit:catalog` to regenerate it.

## Added in this batch

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

## Validation

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
