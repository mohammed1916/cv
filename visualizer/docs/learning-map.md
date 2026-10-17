# Prerequisite map

Open **Prerequisite map** beside **Create Visualizer** on the home page, or use `#prerequisites`.
Hover or keyboard-focus a topic for a compact preview and highlighted prerequisites. Click it to open a native dialog with prerequisites, visual features, searchable problems, and next topics. Escape closes the dialog and returns focus. The map scrolls horizontally on narrow screens.

## Catalog index

`src/data/learningGraph.js` is the versioned learning catalog alongside the existing local problem metadata. It does not write account/billing data to Firestore.

- `LEARNING_TOPICS`: stable IDs, direct prerequisite IDs, related topics, teaching goals, exact catalog tags, ordered recommended problem numbers, and map positions.
- `VISUALIZER_CAPABILITIES`: explicit visual features, source files, relevant topics, and the problem numbers that demonstrate them. A topic tag alone never claims a visual capability.
- `buildLearningIndex(ALL_PROBLEMS)`: `byTopic` (ordered recommendations, all matching implemented problems, capabilities), `byProblem` (topic and capability IDs), and `byNumber` (route metadata). Curated recommendations appear first; remaining matches use tags or explicit visual features. Heavy visualizer modules remain lazy.
- `prerequisitePath(id)`: transitive prerequisites in learning order.

This initial map covers 12 concepts. Membership from existing metadata is only as accurate as those tags. Curated recommendations and explicit capability examples are maintained separately. N-Queens is backtracking/constraint pruning; recursion is related context for BFS, not a required dependency. DFS and DP prerequisites describe the teaching path, not every possible implementation.

To extend: add a topic or feature entry, use existing problem numbers, confirm the feature in the routed implementation, and run `node --test src/data/learningGraph.test.mjs`. This checks graph integrity, route availability, feature references, and reverse indexes.
