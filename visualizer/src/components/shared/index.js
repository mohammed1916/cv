/**
 * Shared visualizer components.
 *
 * Usage:
 *   import { usePlayback, CodePanel, ControlsBar, ProgressBand } from '../../components/shared'
 *
 * CSS theming: set these variables on your problem's root element:
 *   --vis-accent    primary accent color (code row highlights, range input, etc.)
 *   --vis-play      play-button gradient start color
 *   --vis-play-d    play-button gradient end color (darker shade)
 */
export { usePlayback }     from './usePlayback'
export { CodePanel }       from './CodePanel'
export { ControlsBar }     from './ControlsBar'
export { ProgressBand }    from './ProgressBand'
// Pan/zoom shell for SVG diagrams (graphs, trees) inside dock panels.
export { default as SvgViewport } from './SvgViewport'
export { StackLane, BitmaskLane, DPTable, GraphFrontierLane } from './AlgorithmStatePrimitives'
// Linked list and binary tree lanes for pointer and structure problems.
export { default as LinkedListLane } from './LinkedListLane'
export { default as BinaryTreeLane } from './BinaryTreeLane'
export { treeFromLevelOrder, treeFromNary, levelOrderFromTree, layoutTree } from './treeLayout'
export { default as TreeOutline } from './TreeOutline'
// Operation log for design-style problems driven by a list of method calls.
export { default as OperationLog } from './OperationLog'
// Story workspace (code + one scene + narration + play/rewind) and rooted trees of any branching factor.
export { default as StoryWorkspace } from './StoryWorkspace'
export { default as RootedTreeDiagram } from './RootedTreeDiagram'
export { layoutRootedTree } from './treeLayout'
// Union-find (disjoint set) state: parent array, forest of sets, and each find/union operation.
export { default as DisjointSetView } from './DisjointSetView'
export { describeDisjointSetOps, disjointSetForest } from './disjointSetModel.js'
// Intervals and sweep line: bars on a number line, merge/reject roles, and the event list with its running count.
export { default as IntervalView } from './IntervalView'
export { intervalView, intervalTrackLayout, sweepEventRows, eventsFromIntervals, describeIntervalRelation, intervalsOverlap } from './intervalModel.js'
// Fenwick / binary indexed tree: cell ranges, bit jumps of each update and query.
export { default as FenwickView } from './FenwickView'
export { describeFenwickOps, fenwickRange, fenwickRoles, updateChain, queryChain } from './fenwickModel.js'
// Trie operations: created/reused/missing edges and end-of-word marks, plus the node diagram role styling.
export { default as TrieView } from './TrieView'
export { describeTrieOps, trieWalkCells, trieNodeRoles, trieChildren } from './trieModel.js'
// Weighted graphs: edge weights, distance table with relaxations, priority queue, chosen/rejected edges.
export { default as WeightedGraphView } from './WeightedGraphView'
export { describeWeightedOps, distanceRows, layoutCircle, wgraphState } from './wgraphModel.js'
// Binary heap / priority queue: tree + array, each push/pop with its sift-up/sift-down in words.
export { default as HeapView } from './HeapView'
export { TracedHeap, heapView, describeHeapOps, heapHighlights, heapLayout } from './heapModel.js'
// Pointer-level linked list view: named pointers, detached nodes, and next-pointer rewrites.
export { default as ListPointerView } from './ListPointerView'
export { diffListLinks, describeLinkRewrites, walkList, detachedIds, groupPointers, listNodeLabel } from './listPointerModel.js'
// DP tables that show which earlier cells each new cell reads, the recurrence and the reason.
export { default as DPDependencyView } from './DPDependencyView'
export { describeDpTransition, dpCellRoles, linearSources, gridSources, intervalSources, bitmaskSources, knapsackSources } from './dpDependencyModel.js'
// Graph / grid traversal state: structure, frontier (queue or stack), visited, current node and edge, degree or colour tags.
export { default as GraphTraversalView } from './GraphTraversalView'
export { graphCircleLayout, graphNodeRole, isActiveEdge, edgesFromAdjacency, describeFrontier, frontierOps, colourName, degreeTags, colourTags, gridCellRole, cellName } from './graphTraversalModel.js'
// Stacks, queues and deques with every push/pop/front/back operation and its reason.
export { default as StackqView } from './StackqView'
export { StackqLog, StackqLane, describeStackqOps, stackqView, STACKQ_VIEW_LIMIT } from './stackqModel.js'
// Tree traversals: pending call stack / explicit stack / queue, visit order so far, and the decision at the current node.
export { default as TreeWalkView } from './TreeWalkView'
export { treeWalk, stackRows, describeWalkStack, WALK_KINDS, WALK_ROW_CAP } from './treeWalkModel.js'
// Hash map / hash set view: every lookup (hit or miss), insert, update and delete, with the map's contents.
export { default as HashMapView } from './HashMapView'
export { TrackedMap, TrackedSet, hashmapView, describeHashOps, hashEntryRoles, limitHashEntries, hashKeyText } from './hashmapModel.js'
// Segment tree / lazy propagation: nodes visited, fully covered, tags pushed down, values recomputed.
export { default as SegtreeView } from './SegtreeView'
export { SegTree, SEGTREE_MODES, describeSegtreeOps, segtreeRoles, segtreeLayout } from './segtreeModel.js'
