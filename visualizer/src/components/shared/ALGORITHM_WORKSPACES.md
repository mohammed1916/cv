# Adding algorithm visualizers without duplicating the UI

Problems 3913 and 3914 are the first examples of this composition pattern.
Existing problem visualizers and the Playground remain unchanged.

Problems 3903 and 3904 share an entire semantic family under
`src/problems/families/stableIndex`: one algorithm, one view, and a definition
factory with separate constraint limits. Use this pattern when problem rules
truly match; do not duplicate JSX or CSS merely because problem numbers differ.
Their extrema witnesses and inclusive-range comparisons remain specific to
stability, and the trace preserves early-return semantics.

Problem 3909 shows overlapping ascending/descending ranges and separate running
sums. `IndexedSequence` accepts `indexOffset` so a slice retains original array
coordinates; its `active`, `valueAt`, and `roleAt` callbacks still use local
indices. The shared peak appears in both parts and both accumulation traces.

Problem 3910 uses `InducedGraph.jsx` for small subset-enumeration graphs (up to
13 nodes in this problem). Identity comes from node indices, never repeated
values. Solid edges are retained, dashed context edges are excluded, and node
labels distinguish selection from reachability. Every subset decision remains
available in a paged ledger, including odd-sum skips and disconnected rejections.

Problem 3908 separates digit scanning from the leading-digit rule and the final
AND decision. Its tests cover every permitted number/digit pair with an
independent arithmetic oracle, including zero. Simple problems still supply
their own meaningful phases rather than reusing unrelated generic state labels.

Problem 3899 validates the triangle inequality before drawing geometry. Diagram
coordinates preserve actual side-length ratios, while the table maps each side
to its opposite vertex and exposes angles only as calculated. Degenerate inputs
return an empty array without displaying a fabricated triangle. Numerical tests
compare against an independent Heron-area/atan2 formulation and verify lengths
from the generated coordinates.

Problem 3896 separates sieve preprocessing from per-index prime/non-prime
decisions. Its candidate row exposes every value between the input and the
chosen target, while one apply frame represents the exact number of unit
increments. Tests cover every permitted value at both index parities and the
full array bound, including targets larger than the maximum input value.

Additional examples: 3912 demonstrates two directional scans; 3915 demonstrates
distance-gated, opposite-direction dynamic programming with Fenwick maximum
queries. `SubsequencePath.jsx` draws the reconstructed value slopes and original
index gaps. Its pages repeat the preceding endpoint to preserve boundary edges.

Problem 3905 adds simultaneous multi-source BFS. `PagedGrid.jsx` keeps row/column
geometry, coordinate navigation, and per-cell inspection. Its arrival-time model
distinguishes pending proposals from committed colors and retains competing
colors for tie explanations. It stores cells and frontier layers once, rather
than snapshotting the grid on every frame; the 100,000-cell corridor is tested.

- `AlgorithmWorkspace.jsx` owns input validation feedback, examples, playback,
  timeline scrubbing, code highlighting, and the existing Lumino dock panels.
  Playback uses the existing floating panel by default, with a dock/float toggle.
  Each definition supplies `phases` (id, label, description), mapped to trace
  frames and code lines. State buttons seek to their first occurrence; phases
  absent from the current execution are disabled. Current-state highlighting
  follows every timeline change, including backward playback.
- `IndexedSequence.jsx` renders indexed cells, meaningful text labels, and
  navigable 32-cell pages. Paging never truncates the input or execution trace.
- `AlgorithmWorkspace.css` styles these shared components. Neither problem has
  a separate stylesheet.
- Each problem's `algorithm.js` exports independently testable parsing and trace
  generation, plus solution code. Its `index.jsx` supplies metadata, examples,
  and specialized visual/reasoning views.

This is composition, not a universal renderer: a graph, heap, tree, or DP problem
should supply a suitable structural view, reusing the shell and smaller views
where their meaning matches. Do not flatten every algorithm into indexed cells.

Keep traces compact: store changed indices, phases, counters, and offsets rather
than copying full collections every frame. These two implementations support
their official 100,000-element limits with linear trace storage. Generation is
currently synchronous; heavier future algorithms should use a worker.

## Verification

`npm run test:recent-visualizers` checks official examples, exhaustive small
inputs against independent oracles, intermediate states, invalid inputs, and
constraint-sized inputs.

With the dev server running, `node scripts/check-recent-visualizers.mjs` checks
catalog discovery, real Lumino panels, final timeline results, viewport resizing,
paging, validation, and recovery in headless Chrome. Set `CHROME_PATH` for a
non-default Chrome executable and `VISUALIZER_URL` for a different server URL.

Official statements:

- https://leetcode.com/problems/sort-vowels-by-frequency/
- https://leetcode.com/problems/minimum-operations-to-make-array-non-decreasing/
