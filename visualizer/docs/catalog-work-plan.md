# Persistent catalog work plan

Continue implementing missing catalog problems in shared semantic families.
The user requested continuous progress and explicitly waived tests and builds
for this expansion. Preserve original authored examples and actual algorithm
states; do not count catalog listings or empty shells as implementations.

## Current working mode

- Keep using the existing `host` branch and remote.
- Implement each algorithm, bounded input validation, problem-specific goal,
  explanation, teaching steps, and four original examples.
- Reuse workspace, input controls, playback, code panel, and scene primitives.
- Register routes without executing examples using
  `node scripts/register-authored-stories.mjs --skip-example-validation`.
- Record unverified additions with `node scripts/record-unverified-expansion.mjs`.
- Keep prior test reports as historical evidence; do not imply that new routes
  passed those reports. No tests, builds, or browser verification are running.
- Refresh the metadata-only catalog inventory as implementation progresses.
- Checkpoint implementation on `host`, then proceed to another missing group.

## Deferred at the user's request

The code panel should default to **complete Python solutions**, with
**Pseudocode** available as an alternate language/view. Continue the current
catalog expansion first; finish the language conversion afterward. A source
draft for 50 collection problems is in
`src/problems/families/python/collectionPython.js`; it is not wired into the UI.
Keep execution-line highlighting truthful when adding the alternate views.

Runtime validation, browser interactions, and final correctness review remain
outstanding. Skipping checks accelerates source authoring, not verification.

## Machine-readable progress

- `catalog-coverage.json`: every catalog entry and matched route.
- `unverified-expansion.json`: new unverified problem IDs and example counts.
- `catalog-story-inventory.json`: connected story metadata for implemented routes.

Remaining catalog entries are not restricted to the next numerical ID range.
Fill semantic families where appropriate, while tracking harder graph, tree,
design, concurrency, and database problems as separate implementation work.
