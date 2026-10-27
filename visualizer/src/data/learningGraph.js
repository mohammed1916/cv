import { LEARNING_CONCEPTS, CONCEPT_BY_ID } from './learningTaxonomy.js';

// Capabilities are attached only to verified example routes, not inferred from tags.
export const VISUALIZER_CAPABILITIES = [
  { id: 'queue-layers', title: 'Queue & traversal layers', description: 'Watch the frontier and the level currently being processed.', problems: ['B10', '102'], source: 'src/components/shared/TraversalTreePanel.jsx' },
  { id: 'call-tree', title: 'Recursive call tree', description: 'Follow nested calls and recursive search branches.', problems: ['301', '1096'], source: 'src/components/shared/RecursiveCallTree.jsx' },
  { id: 'staircase', title: 'Staircase recurrence', description: 'Connect each stair to earlier counts that reach it.', problems: ['70'], source: 'src/components/shared/StaircaseScene.jsx' },
  { id: 'dp-grid', title: 'DP table & active cell', description: 'Follow the LCS table as matching and skipping characters fill each cell.', problems: ['1143'], source: 'src/problems/Problem1143/LCSVisualizer.jsx' },
  { id: 'union-find', title: 'Union-find forest & operations', description: 'Watch each find walk its parent chain, path compression re-point nodes, and each union attach the smaller tree under the larger.', problems: ['737', '765', '839', '947', '952', '990', '1319', '1627', '685', '924', '928', '1168', '827', '959', '2421', '2492', '2685', '2709', '2948', '3108'], source: 'src/components/shared/DisjointSetView.jsx' },
  { id: 'hash-map-view', title: 'Hash map operations', description: 'Watch each lookup hit or miss, insert, update, and delete, with the map contents.', problems: ['1679', '1346', '2395', '1711', '1941', '1797', '2006'], source: 'src/components/shared/HashMapView.jsx' },
  { id: 'interval-track', title: 'Intervals on a number line & sweep events', description: 'See each interval as a bar, which one is current, merged, kept or rejected, and the sweep-line event list with its running count.', problems: ['729', '731', '732', '715', '757', '1094', '1109', '1288', '1851', '1893', '1943', '2015', '2054'], source: 'src/components/shared/IntervalView.jsx' },
  { id: 'fenwick-tree', title: 'Fenwick tree bit jumps', description: 'See each update climb with i += i & -i and each prefix query descend with i -= i & -i, with the range every cell covers.', problems: ['2031', '2179', '3915'], source: 'src/components/shared/FenwickView.jsx' },
  { id: 'segment-tree-ops', title: 'Segment tree queries, updates & lazy tags', description: 'See which nodes a range query or update visits, which are fully covered, and pending lazy tags pushed down.', problems: ['699', '715', '732', '2213', 'B6'], source: 'src/components/shared/SegtreeView.jsx' },
  { id: 'list-pointers', title: 'Linked list pointers & rewrites', description: 'See every next-pointer rewrite (was/now), named pointers such as prev, cur, slow, fast, dummy and tail, and nodes cut off from the head.', problems: ['707', '725', '876', '82', '2046', '2074', '2095', '2130', '2487'], source: 'src/components/shared/ListPointerView.jsx' },
  { id: 'dp-dependencies', title: 'DP transition: cells read & recurrence', description: 'See which earlier cells a new 1-D, grid, interval, bitmask or knapsack DP cell reads, which one won, and the recurrence in words.', problems: ['712','1035','1458','1043','664','1000','1105','1130','1155','634','651','790','639','1986'], source: 'src/components/shared/DPDependencyView.jsx' },
  { id: 'tree-walk-state', title: 'Tree walk: call stack, visit order, decision', description: 'See the pending recursion or explicit stack, the order built so far, and the comparison made at the current tree node.', problems: ['606', '617', '637', '653', '654', '669', '687', '690', '700', '701', '783', '872', '897', '938', '965'], source: 'src/components/shared/TreeWalkView.jsx' },
  { id: 'trie-operations', title: 'Trie walks: created vs reused nodes', description: 'See every character of an insert, search or prefix walk as a new node, a reused shared node or a missing edge, with end-of-word marks on the trie.', problems: ['648', '677', '720', '820', '1032', '1268', '1804', '1938', '1948'], source: 'src/components/shared/TrieView.jsx' },
  { id: 'heap-operations', title: 'Heap push, pop and sift', description: 'See the heap as a tree and as its array, with every push, pop, sift-up and sift-down explained.', problems: ['630', '857', '871', '786', '787', '882', '2203', '2093', '2163', '2208', '2233'], source: 'src/components/shared/HeapView.jsx' },
  { id: 'graph-traversal', title: 'Graph & grid traversal frontier', description: 'See the graph or grid, the queue or stack frontier with each enqueue/dequeue/push/pop, visited nodes, the node and edge being examined, and in-degree or colour tags.', problems: ['785', '886', '797', '802', '851', '847', '934', '733', '127'], source: 'src/components/shared/GraphTraversalView.jsx' },
  { id: 'weighted-graph-view', title: 'Weighted graph: relaxations, queue, chosen edges', description: 'See edge weights, each distance relaxation (old to new), the priority queue, and chosen or rejected spanning-tree edges.', problems: ['743', '787', '882', '1135', '1168', '1584', '1976', '2065', '2093', '2203'], source: 'src/components/shared/WeightedGraphView.jsx' },
  { id: 'stack-queue-ops', title: 'Stack, queue & deque operations', description: 'Watch every push, pop, front and back operation, with the reason each element is kept or popped and both ends of a deque.', problems: ['735', '901', '946', '1047', '1438', '1696', '862', '2454'], source: 'src/components/shared/StackqView.jsx' },
  { id: 'queen-rays', title: 'Queen attack rays', description: 'See row, column, and diagonal conflicts for the next candidate.', problems: ['51'], source: 'src/components/shared/GridRayOverlay.jsx' },
];

const TAG_ALIASES = { DP: 'Dynamic Programming', BFS: 'Breadth-First Search', DFS: 'Depth-First Search', 'Union-Find': 'Union Find', 'Heap (Priority Queue)': 'Heap', 'Priority Queue': 'Heap', 'Binary Indexed Tree': 'Fenwick Tree' };
const normalizeTag = tag => TAG_ALIASES[tag] || tag;
const unique = values => [...new Set(values)];

export function prerequisitePath(id) {
  const result = new Set();
  const visiting = new Set();
  function visit(key) {
    if (visiting.has(key)) throw new Error(`Prerequisite cycle at ${key}`);
    visiting.add(key);
    for (const parent of CONCEPT_BY_ID[key]?.requires || []) {
      if (!result.has(parent)) { visit(parent); result.add(parent); }
    }
    visiting.delete(key);
  }
  visit(id);
  return [...result];
}

export function buildLearningIndex(problems) {
  const byNumber = new Map(problems.filter(problem => problem.implemented).map(problem => [String(problem.number), problem]));
  const available = [...byNumber.values()];
  const byConcept = {};
  function build(id) {
    if (byConcept[id]) return byConcept[id];
    const concept = CONCEPT_BY_ID[id];
    const children = LEARNING_CONCEPTS.filter(item => item.parent === id);
    const childEntries = children.map(item => build(item.id));
    const curated = concept.picks.map(number => byNumber.get(number)).filter(Boolean);
    const tags = new Set(concept.tags.map(normalizeTag));
    const direct = unique([...curated, ...available.filter(problem => problem.tags?.some(tag => tags.has(normalizeTag(tag))))]);
    const recommended = curated.length ? curated : unique(childEntries.flatMap(entry => entry.recommended)).slice(0, 6);
    const members = unique([...recommended, ...direct, ...childEntries.flatMap(entry => entry.problems)]);
    const memberNumbers = new Set(members.map(problem => String(problem.number)));
    const childMembers = new Set(childEntries.flatMap(entry => entry.problems));
    const capabilities = VISUALIZER_CAPABILITIES.map(feature => ({ ...feature, problems: feature.problems.filter(number => memberNumbers.has(number)) })).filter(feature => feature.problems.length);
    return byConcept[id] = { children, recommended, direct, problems: members, capabilities, ungrouped: members.filter(problem => !childMembers.has(problem)) };
  }
  LEARNING_CONCEPTS.forEach(concept => build(concept.id));
  const membership = new Map(LEARNING_CONCEPTS.map(concept => [concept.id, new Set(byConcept[concept.id].problems)]));
  const byProblem = Object.fromEntries(available.map(problem => [problem.number, {
    concepts: LEARNING_CONCEPTS.filter(concept => membership.get(concept.id).has(problem)).map(concept => concept.id),
    directConcepts: LEARNING_CONCEPTS.filter(concept => byConcept[concept.id].direct.includes(problem)).map(concept => concept.id),
    capabilities: VISUALIZER_CAPABILITIES.filter(feature => feature.problems.includes(String(problem.number))).map(feature => feature.id),
  }]));
  return { byConcept, byProblem, byNumber };
}
