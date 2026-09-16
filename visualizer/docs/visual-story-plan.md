# Problem-specific visual stories and shared UI

## Contract

Each visualizer should explain the problem's objects, the current decision,
why the next change happens, and why the final answer is valid. A list of
variables or generic animated cells alone does not establish that contract.
Climbing Stairs is a useful reference: stairs and one/two-step dependencies
belong to its explanation, while buttons and panel frames can be shared.

Keep problem geometry and algorithm states local. Reuse workspace chrome,
inputs, playback, typography, spacing, node/edge primitives where appropriate,
and theme tokens. Do not force all problems into one renderer or eagerly
import the full renderer catalog.

## Inventory

Run `node scripts/inventory-visual-stories.mjs` to refresh the per-entry source
and CSS inventory. Its flags are mechanical signals, not quality scores.
Run `node scripts/audit-css-duplication.mjs` for exact declaration candidates.
Review the cascade before consolidating a candidate. Compare compressed build
output and browser-loaded CSS; source bytes alone do not predict load savings.

## Initial review batch

| Problem | Visual story | Status |
| --- | --- | --- |
| 112 Path Sum | Walk a root-to-leaf route; carry a remaining target; reject leaves and backtrack; stop on success | Pilot implemented; 5 algorithm tests and desktop/mobile browser checks passed |
| 111 Minimum Depth | Contrast complete root-to-leaf routes with missing children; show why a missing child is not a shorter route | Implemented; 6 algorithm tests and desktop/mobile browser checks passed |
| 110 Balanced Binary Tree | Return child heights upward; expose the first excessive height difference and propagate failure | Pending detailed review |
| 11 Container With Most Water | Show water limited by the shorter wall and the width/height tradeoff when moving a pointer | Existing water view; review before redesign |
| 109 Sorted List to BST | Relate the ordered list interval to its chosen root and recursively split intervals | Pending detailed review |

These are the proposed first batch, not a claim that the entire catalog is
complete. Broader batches should group shared UI work, while keeping an
individual story acceptance checklist for each problem.

## First implementation checkpoint

- Path Sum now renders the actual tree with stable node IDs, route edges,
  remaining target, leaf checks, backtracking, and success short-circuiting.
  Its examples now update both inputs; invalid input no longer produces a
  trace from fallback string characters. The code sample has valid grouping
  around its multiline return expression.
- Problems 109, 110, 111, and 112 reuse `vis-shell`; their repeated shell
  declarations were removed. Nine more visualizers reuse `vis-panel-head`,
  removing 2,402 source bytes of repeated header declarations.
- The CSS migration comparison passed 208 theme/width/hover combinations
  across 13 visualizers. Including the new Path Sum geometry styles, the
  changed CSS files are 1,257 source bytes smaller (normalized line endings).
  This is not a claim about compressed transfer savings.
- Five algorithm tests (including 1,152 exhaustive small-tree/target cases),
  focused lint, the production build, example-input interaction, final result,
  non-leaf rejection, and desktop/mobile browser checks passed. The existing
  large JavaScript chunk advisory remains a separate issue.

## Minimum Depth checkpoint

- Depth bands count nodes from the root. A dashed missing-child cue explains
  why an absent branch cannot win the comparison. Completed leaf routes are
  listed separately, with a provisional best route and a final winner.
- Postorder return frames match the displayed recursive solution; code line
  references no longer point to unrelated branches. Sparse level-order input
  is parsed locally without changing the legacy tree helper used elsewhere.
- Invalid inputs show an error instead of running a fallback tree. Duplicate
  input/example controls and their CSS were removed; shared input, panel,
  playback, docking, and code components remain in use.
- Problem111 CSS decreased from 3,978 to 1,865 source bytes (normalized line
  endings); gzip of that source file decreased from 1,035 to 622 bytes. These
  are file measurements, not a claim about whole-app transfer savings.
- Six tests cover 256 exhaustive sparse tree shapes, duplicate values, empty
  trees, the one-child trap, invalid inputs, and a 5,000-node chain. All 11
  tests across Minimum Depth and Path Sum pass. Desktop/mobile checks verify
  the missing-child cue, examples, tie result, empty-tree result, and no
  browser errors. Focused lint and production build pass.

## Release checks for each batch

- Validate trace decisions against the actual algorithm, including no-solution
  inputs, duplicates, negative values where legal, and boundary cases.
- Match code highlighting to the depicted decision; do not display generic
  pattern labels when the trace does not implement those phases.
- Check input examples, seeking, reset, playback, floating/docking, light/dark
  themes, and narrow panel widths.
- Compare before/after CSS and JavaScript sizes. A richer visualization may
  add local CSS even while repeated UI rules are removed; report both honestly.
- Record which entries were reviewed. Never treat a passing build or shared
  component usage as proof of meaningful visualization.
