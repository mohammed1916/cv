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

## Full-catalog rollout (active)

Scope: every registered problem, including existing bespoke visualizers and
shared AlgorithmWorkspace entries. Resume after the Climbing Stairs pilot.
The refreshed baseline is 613 entries, 700 CSS files and 1,867,533 CSS source
bytes before this batch. These are inventory counts, not completed stories.

Use `docs/visual-story-progress.json` as the per-problem review ledger. Keep
story and playground statuses separate. An existing screenshot, SVG, shared
workspace, or successful build never automatically marks a problem complete.
Refresh the inventory after each batch; reconcile newly registered entries
into the ledger. Keep removed entries for history until explicitly reviewed.

### Design and reuse rules

- Write a short story for each problem: objects, decision, consequence,
  invariant, failure case, and final proof. Choose geometry from that story.
- Share controls, panel framing, input validation patterns, typography, theme
  tokens, legends, accessible status treatments, and navigation. Prefer the
  existing shared components before introducing another version.
- Share visual primitives when meaning matches: node identity, edges, pointer
  rails, intervals, dependency links, sequences and scrollable SVG viewports.
  Keep each problem's composition, annotations, transitions and trace adapter
  local. Stair dependencies, heap repair and DP subproblems need distinct views.
- Extract repeated JSX/CSS after reviewing concrete consumers and their
  cascade. Avoid speculative universal components with many problem switches.
- Make animations explain a state change. Support seeking, reduced motion,
  keyboard controls, non-color cues, dark/light themes and narrow dock panels.
- Load stories and adapters with their problem routes. Avoid eager catalog
  registries and barrel imports that pull every renderer into the main bundle.
- Measure source CSS, production gzip, initial-route assets and representative
  lazy chunks before/after each consolidation. Smaller source files alone do
  not establish transfer savings. Record justified size increases for richer
  stories; never hide bundle warnings by raising their limit.

### Delivery sequence

1. Trees: finish 110, then 109; review traversal, construction, comparison and
   path problems separately while extracting genuinely shared tree primitives.
2. Arrays and pointers: review 11, Two Sum and sliding-window/interval stories.
3. Linked structures, stacks, queues and heaps: emphasize identity, links,
   frontier order, swaps and restoration of invariants.
4. DP: partition by recurrence geometry (stairs, sequences, grids, intervals,
   trees, state machines); visualize dependencies and chosen/rejected choices.
5. Graphs and search: expose frontier, visited state, edges, costs, cycles,
   backtracking and pruning without inventing unexecuted work.
6. Remaining strings, tries, greedy, math, bit operations, geometry and special
   problems: define individual stories before selecting reusable pieces.

Work in reviewable batches with an explicit status for every entry. For each
problem, complete algorithm fixtures, story implementation, browser checks,
CSS/JS measurements and playground assessment before marking it verified.
Do not replace all existing visualizers mechanically.

### Playground contract across the catalog

Generalize launch metadata, entry point and input serialization incrementally.
Opening a workspace must preserve existing drafts. A custom story needs a
tested execution-to-story adapter and clear compatibility checks. Unsupported
or changed code uses truthful general execution visuals and may offer an AI
proposal; the user reviews and accepts changes. AI must not invent a matching
animation or silently rewrite code. Keep launch support, renderer support and
arbitrary-edit support as separate capabilities in the ledger.

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
| 110 Balanced Binary Tree | Return child heights upward; expose the first excessive height difference and propagate failure | Trace corrected, height comparison added; full visual acceptance still in progress |
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

## Climbing Stairs playground pilot

Catalog story work resumed after verification of this pilot.
Climbing Stairs now replaces its inert Edit code action with Open in Code
Playground. A confirmation copies the displayed Python solution and current
input into a separate, persistent workspace; the original playground draft
is preserved. The existing sign-in and usage limits still apply.

The problem and playground share a staircase component and its CSS. Inside
the playground, counts come from executed Python trace frames. This first
adapter supports the exact imported solution, its entry point, and integer
inputs from 1 to 45. Changed source uses general execution visuals; it does
not replay the original algorithm as if it were the edited code. Existing
AI suggestions still require review and acceptance before applying changes.

The pilot includes links back to the problem and the original playground
draft. Other problems retain their current editing behavior. Future story
adapters should declare their trace requirements and fallback explicitly.

Validation: four handoff/trace tests, 36 Python playground tests, and six
WebMCP tests pass. Focused lint has no errors (the existing CodeTracePanel
hook warning remains). Production build passes; the main JavaScript chunk
is still above 500 kB. Browser checks cover confirmation, cancellation,
draft preservation, and the normal sign-in gate.
Follow-up browser verification passed with the real Python worker: selecting
a frame displays the staircase, seeking to the end produces the expected
count, seeking backward clears future values, and editing the saved source
switches to the general-visuals fallback. The earlier timeout came from
waiting for a staircase before selecting a frame: Run Python prepares the
timeline; Next or Play starts displaying its frames. These execution checks
used a temporary isolated component page; the normal app sign-in gate was
checked separately and remains unchanged. A narrow viewport was also rendered;
small docked preview panels require scrolling to see the full staircase.
The four handoff/trace tests now include the maximum supported input, n = 45,
with expected count 1,836,311,903, using real CPython execution.

## Release checks for each batch

### Balanced Binary Tree: first resumed batch

- Extracted a tested trace that follows the displayed left/right failure
  guards. The first local height mismatch and inherited failure are distinct;
  skipped right subtrees remain unprocessed. Child-height meters explain the
  allowed difference and the first failing node remains identified.
- Corrected sparse level-order parsing and reject invalid/orphan values.
  Removed the duplicate input implementation in favor of ManualInputPanel.
  The tree is visible before playback; its canvas grows with depth and no
  longer collapses through a flex override. Pattern labels describe the
  actual traversal/comparison/return operations.
- Four tests pass, including independent results over valid small sparse
  trees, both failure guards, invalid inputs and immutable frame snapshots.
  Focused lint passes. Desktop browser checks verify editable input, docking,
  final unbalanced result, first-failure identity, canvas height and no page
  errors. Production build passes with the existing chunk advisory.
- Still pending before full story verification: dense/deep tree layout,
  reduced-motion handling, mobile and both-theme interaction checks, complete
  route-transfer measurements, and a playground adapter. This entry remains
  in progress; launch support is not inferred from its new trace.
- Problem110 CSS decreased from 3,602 to 3,166 normalized source bytes;
  gzip of that file decreased from 882 to 840 bytes. These measurements cover
  the local stylesheet only, not whole-app transfer size.

### Acceptance checklist

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
