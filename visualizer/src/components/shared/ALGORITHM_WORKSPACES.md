# Adding algorithm visualizers without duplicating the UI

Problems 3913 and 3914 are the first examples of this composition pattern.
Existing problem visualizers and the Playground remain unchanged.

- `AlgorithmWorkspace.jsx` owns input validation feedback, examples, playback,
  timeline scrubbing, code highlighting, and the existing Lumino dock panels.
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
