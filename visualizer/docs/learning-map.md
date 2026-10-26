# Canonical learning map

Open **Prerequisite map** beside **Create Visualizer** on Home, or use `#prerequisites`.

The map has 21 broad areas and 123 canonical concepts. A title opens its guide; **+ subtopics** expands only its immediate children. Breadcrumbs support multiple levels, such as DP → Knapsack → 0/1 knapsack. Escape/collapse returns to the overview and restores focus. Child clusters become a single column on narrow screens and respect reduced motion. Search covers the entire hierarchy, including collapsed and concept-only entries.

## Three distinct relationships

- `parent`: exactly one navigational home. Prefix sums lives under Arrays and is not also a top-level topic. BFS lives under Graph fundamentals. Knapsack variants live under Knapsack, inside DP.
- `requires`: suggested learning prerequisites, independent of the home. BFS requires Queue and Graph fundamentals, not recursion. Cycles are invalid.
- `related`: cross-topic references to the same canonical ID. Sliding window can be opened from Strings without creating a second definition. These are not prerequisite edges.

The overview draws prerequisite connections on hover/focus to avoid showing every edge at once. Dotted branches in an expanded cluster express containment. Guides show the actual prerequisites and related links separately.

## Data and indexes

`src/data/learningTaxonomy.js` is the canonical registry. Each concept has an ID, home, description, curated problem numbers, optional catalog tags, prerequisite IDs, and related IDs. Top-level layout coordinates belong only to root concepts. Reference links are stored separately in `LEARNING_SOURCES`.

`src/data/learningGraph.js` builds metadata-only indexes without eagerly loading visualizer implementations:

- `byConcept[id]`: immediate children, direct matches, ordered suggestions, all descendant matches, explicitly indexed capabilities, and problems not yet grouped into children.
- `byProblem[number]`: all matching concept IDs, direct concept IDs, and capability IDs.
- `byNumber`: implemented route metadata. Unavailable routes are excluded. Duplicate problem numbers are deduplicated consistently.

Descendant problem membership rolls up to its ancestors; cross-links do not copy membership or definitions. Counts can overlap across techniques. A technique's canonical home is its learning organization, not a claim that it only applies to that data structure.

Tags normalize DP, BFS, DFS, Union-Find, heap/priority-queue aliases, and binary indexed trees. Tags can describe alternate problem solutions, so a catalog match does not promise that the routed visualizer demonstrates that algorithm. Visual capabilities are a separate explicit registry of implementation examples. Alpha-beta pruning, bounded knapsack, and other concepts without indexed examples are labeled **Concept only**, with prerequisites and references; they never borrow unrelated visualizers. N-Queens attack checks are constraint pruning, not alpha-beta or DP.

## Coverage

Areas include arrays/sequences, strings, hashing, linked lists, stacks/queues/deques, bits, math, search/sort, recursion, trees/tries, graphs, intervals, simulation, geometry, heaps, backtracking, DP, greedy methods, range-query structures, advanced graphs, and games.

Deeper branches include fixed/variable windows; opposing/fast-slow pointers; prefix sums and difference arrays; trie/string matching; monotonic structures; BFS/DFS/DSU/topological ordering; Dijkstra/0–1 BFS/Bellman–Ford/Floyd–Warshall; MST/SCC/bridges/flows/matching; knapsack variants; sequence/grid/tree/interval/digit/probability/bitmask DP; Fenwick/segment/lazy/sparse structures; bit masks/XOR/submasks; counting/modular arithmetic; convex hulls; minimax/alpha-beta/Nim; and grid/robot/event simulation.

Simulation means implementing a process's state-transition rules. LeetCode's Game of Life is a concrete example: every next cell state must use the old generation consistently. Event-driven simulation skips directly to meaningful state changes.

## Research references

- [CP-Algorithms: knapsack](https://cp-algorithms.com/dynamic_programming/knapsack.html) — 0/1, complete/unbounded, bounded/multiple, and mixed item-availability rules.
- [CP-Algorithms: algorithm index](https://cp-algorithms.com/) and [strongly connected components](https://cp-algorithms.com/graph/strongly-connected-components.html) — graph, range-query, math, geometry, and bit-technique organization.
- [Berkeley CS188: minimax and alpha-beta](https://inst.eecs.berkeley.edu/~cs188/textbook/games/minimax.html) — alpha-beta as an adversarial minimax optimization, separate from constraint pruning.
- [LeetCode: Game of Life](https://leetcode.com/problems/game-of-life/) — simultaneous board-state updates as a simulation example.

The taxonomy is curated and extensible, not an exhaustive claim about every algorithm or an implementation-coverage guarantee.

## Validation

Run `node --test src/data/learningGraph.test.mjs`. Tests cover unique IDs/titles, hierarchy/prerequisite cycles, all references, route availability, nested rollups, deduplication, reverse lookups, aliases, canonical search, and truthful concept-only states. When extending the map, reuse an existing ID for cross-links and add new definitions only for distinct concepts.
