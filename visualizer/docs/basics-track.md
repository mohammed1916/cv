# Basics track

The track has fifteen free lessons, ordered B1–B15: matrix iteration, linear search,
binary search, lower bound, min-heap operations, segment trees, tries, histogram
rectangles, prefix sums, breadth-first search, two-pointer pair search, fixed-size
sliding windows, insertion sort, next greater elements, and Euclidean GCD.

Each lesson has a discoverable `meta.js` and lazy `index.jsx` under `src/problems`.
`src/data/basicsCatalog.js` supplies the same metadata to the alternate HomePage.
The `Basics` tag grants free access through the existing access policy.

## Shared implementation

- `src/algorithms/shared/basicsExtended.js` reuses the shared snapshot tracer for
  the five additional algorithms. `extendedDefinitions.js` owns their code,
  validation, and edge-case presets; `ExtendedBasicsScene` composes existing
  indexed arrays and state tables to show pointers, windows, held keys, stacks,
  and remainder calculations.

- `src/algorithms/shared/binarySearch.js` and `histogram.js` supply the traced
  algorithms and code listings to both the Basics lessons and Problems 704/84.
- `SearchWindow`, `HistogramBars`, `StructureTree`, `TrieStateDiagram`,
  `IndexedSequence`, and `SvgViewport` provide reusable state views.
- `src/algorithms/shared/basics.js` contains pure traced search, range, trie, and
  graph algorithms. The heap lesson instruments the existing `AuthoredMinHeap`
  with an optional callback; existing priority-queue consumers keep the same API.
- `src/problems/families/basics/definitions.js` supplies validation, authored
  presets, invariants, code listings, and adapters to the shared workspace.
- `BasicsStory` owns the concept-specific composition. `AlgorithmWorkspace`
  continues to own inputs, docking, playback, code display, and the timeline.

Binary search rejects unsorted Basics input instead of silently changing the
indices. Range endpoints are inclusive for prefix sums and segment trees;
lower bound deliberately uses a half-open search interval and can return n.
An empty heap pop returns null. BFS uses undirected, unweighted edges and returns
null for unreachable vertices. Inputs are bounded for readable playback.

## Validation

`npm run test:basics` runs independent reference comparisons, seeded randomized
cases, input validation, heap API compatibility, snapshot isolation, route/free
access checks, and server rendering of all preset frames. It does not replace a
browser test of dragging, resizing, theme changes, and playback interaction.

Run `npm run test:sequence-stories` when changing the shared heap or tree renderer,
and `npm run build` to verify the lazy imports and browser compilation.
