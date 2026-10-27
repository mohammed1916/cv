// One canonical record per concept. parent is navigation; requires is learning
// order; related is a cross-reference and never creates a second concept.
const c = (id, parent, title, summary, picks = [], tags = [], requires = [], related = [], extra = {}) =>
  ({ id, parent, title, summary, picks, tags, requires, related, ...extra });

export const LEARNING_SOURCES = {
  knapsack: { title: 'CP-Algorithms: knapsack variants', url: 'https://cp-algorithms.com/dynamic_programming/knapsack.html' },
  graphs: { title: 'CP-Algorithms: graph algorithms', url: 'https://cp-algorithms.com/' },
  games: { title: 'Berkeley CS188: minimax and alpha-beta pruning', url: 'https://inst.eecs.berkeley.edu/~cs188/textbook/games/minimax.html' },
  simulation: { title: 'LeetCode: Game of Life rules', url: 'https://leetcode.com/problems/game-of-life/' },
};

export const LEARNING_CONCEPTS = [
  c('arrays', null, 'Arrays & sequence patterns', 'Read indexed data, then choose a pattern for scanning or aggregating it.', ['B2', '1', '896', '31', '189'], ['Array'], [], [], { column: 0, row: 0 }),
  c('strings', null, 'Strings & text', 'Work with characters, substrings, parsing, and shared prefixes.', ['242', '14', '482', '1119', '151'], ['String'], [], ['two-pointers', 'sliding-window'], { column: 0, row: 1 }),
  c('hashing', null, 'Hash maps & sets', 'Remember seen values, frequencies, and keyed state for fast lookup.', ['1', '217', '1346', '2395', '1797', '219', '2013', '49'], ['Hash Table'], [], [], { column: 0, row: 2 }),
  c('linked-list', null, 'Linked lists', 'Follow node references and reconnect links without losing the remaining list.', ['206', '21', '237', '328', '160'], ['Linked List'], [], ['two-pointers'], { column: 0, row: 3 }),
  c('stack-queue', null, 'Stacks, queues & deques', 'Choose which waiting item is processed next: last, first, or either end.', ['20', '232'], ['Stack', 'Queue'], [], [], { column: 0, row: 4 }),
  c('bits', null, 'Bit manipulation', 'Represent and transform information one binary digit at a time.', ['191', '136', '89', '137', '190'], ['Bit Manipulation'], [], [], { column: 0, row: 5 }),
  c('math', null, 'Math & number theory', 'Use arithmetic structure, counting, and probability to avoid brute force.', ['B15', '204', '258', '172', '263'], ['Math', 'Number Theory'], [], [], { column: 0, row: 6 }),
  c('search-sort', null, 'Searching & sorting', 'Use ordering, partitions, and monotonic conditions to reduce work.', ['B3', 'B13', '912', '658', '75', '274', '349', '826'], ['Binary Search', 'Sorting'], ['arrays'], [], { column: 1, row: 0 }),
  c('recursion', null, 'Recursion & divide-and-conquer', 'Solve a smaller input, then return and combine its answer with the caller.', ['104', '50', '95', '241', '339'], ['Recursion', 'Divide and Conquer'], ['stack'], [], { column: 1, row: 1 }),
  c('trees', null, 'Trees & tries', 'Exploit hierarchical structure, subtrees, and paths from a root.', ['104', 'B7', '105', '106', '108'], ['Tree', 'Binary Tree', 'Trie'], ['recursion'], ['bfs', 'dfs'], { column: 1, row: 2 }),
  c('graphs', null, 'Graph fundamentals', 'Model neighbors and reachability before choosing a traversal or connectivity tool.', ['B10', '133', '200', '261', '399'], ['Graph'], [], [], { column: 1, row: 3 }),
  c('intervals', null, 'Intervals & events', 'Reason about ranges, overlap, endpoint order, and active events.', ['56', '57', '729', '252', '253'], ['Interval', 'Intervals'], ['sorting'], ['greedy', 'heaps'], { column: 1, row: 4 }),
  c('simulation', null, 'Simulation & state machines', 'Apply the stated rules to update a process step by step: a board, robot, queue, or event timeline.', ['289', '54', '723', '353', '957'], ['Simulation'], ['arrays'], [], { column: 1, row: 5, source: 'simulation' }),
  c('geometry', null, 'Geometry', 'Use coordinates, orientation, distances, and boundaries to reason about shapes.', ['149', '223', '1828', '3899', '335'], ['Geometry'], ['math'], [], { column: 1, row: 6 }),
  c('heaps', null, 'Heaps & priority queues', 'Repeatedly retrieve the best-priority item while maintaining heap order.', ['B5', '215', '1046', '1167', '1705'], ['Heap', 'Priority Queue'], ['arrays'], ['dijkstra', 'event-simulation'], { column: 2, row: 0 }),
  c('backtracking', null, 'Backtracking & pruning', 'Choose, explore, undo, and reject impossible partial solutions early.', ['78', '51', '37', '52', '79'], ['Backtracking'], ['recursion'], [], { column: 2, row: 1 }),
  c('dp', null, 'Dynamic programming', 'Define reusable states and transitions for overlapping subproblems.', ['70', '198', '322', '139', '221'], ['Dynamic Programming'], ['arrays', 'recursion'], [], { column: 2, row: 2 }),
  c('greedy', null, 'Greedy algorithms', 'Make a locally justified choice and prove it preserves an optimal solution.', ['55', '134', '330', '455', '1005'], ['Greedy'], [], ['intervals', 'heaps'], { column: 2, row: 3 }),
  c('range-query', null, 'Range-query structures', 'Choose a data structure based on whether queries and updates are static or dynamic.', ['B6', '307', '308', '715', '2940'], ['Segment Tree', 'Binary Indexed Tree', 'Range Query'], ['arrays'], ['prefix-sums'], { column: 2, row: 4 }),
  c('advanced-graphs', null, 'Advanced graphs', 'Extend traversal to weighted paths, structural decompositions, flows, and matching.', ['743', '1584', '1192', '1820'], [], ['graphs'], [], { column: 3, row: 0, source: 'graphs' }),
  c('games', null, 'Game theory & adversarial search', 'Reason about an opponent who chooses the best response, not a random next move.', ['486', '292', '294', '913', '1025'], ['Game Theory', 'Minimax'], ['recursion'], ['dp'], { column: 3, row: 1, source: 'games' }),

  c('two-pointers', 'arrays', 'Two pointers', 'Coordinate two positions to avoid testing every candidate pair.', ['B11', '167', '11', '15', '259', '42', '283'], ['Two Pointers'], ['arrays'], ['linked-list', 'strings']),
  c('opposing-pointers', 'two-pointers', 'Opposing pointers', 'Move inward from both ends using an ordering or comparison invariant.', ['167', '11', '125', '344', '345', '680'], [], ['two-pointers']),
  c('fast-slow', 'two-pointers', 'Fast & slow pointers', 'Use different speeds to locate a midpoint or detect a cycle.', ['141', '142', '876', '2095', '19', '287', '457'], [], ['two-pointers'], ['linked-list']),
  c('sliding-window', 'arrays', 'Sliding window', 'Maintain a contiguous range and reuse work when its boundaries change.', ['B12', '209', '3', '239', '76', '159'], ['Sliding Window'], ['arrays'], ['strings', 'monotonic-deque']),
  c('fixed-window', 'sliding-window', 'Fixed-size windows', 'Remove the outgoing value and add the incoming value without changing window length.', ['B12', '643', '438', '346', '567', '1052'], [], ['sliding-window']),
  c('variable-window', 'sliding-window', 'Variable-size windows', 'Grow or shrink a window while preserving a problem-specific validity condition.', ['209', '3', '76', '159', '340', '424'], [], ['sliding-window']),
  c('prefix-sums', 'arrays', 'Prefix sums', 'Store cumulative totals so a range can be recovered from its boundaries.', ['B9', '303', '560', '325', '724', '974'], ['Prefix Sum'], ['arrays'], ['range-query']),
  c('prefix-2d', 'prefix-sums', '2D prefix sums', 'Combine four corner reads using inclusion-exclusion to recover a rectangle sum.', ['304', '1292', '1314', '1738'], [], ['prefix-sums']),
  c('difference-array', 'arrays', 'Difference arrays', 'Mark range-update boundaries and reconstruct values with a prefix scan.', ['370', '1094', '1109', '2021', '1854'], [], ['prefix-sums']),
  c('matrix-traversal', 'arrays', 'Matrix traversal', 'Keep row and column bounds explicit while traversing or transforming a grid.', ['B1', '54', '48', '59', '498', '661'], ['Matrix'], ['arrays'], ['grid-simulation', 'bfs']),

  c('string-matching', 'strings', 'String matching', 'Locate a pattern in text while avoiding redundant comparisons.', ['28', '459', '686', '1408', '1967'], ['String Matching'], ['strings']),
  c('kmp', 'string-matching', 'KMP & prefix function', 'Use the matched prefix to decide where comparison can resume after a mismatch.', ['214', '1392', '459'], ['KMP'], ['string-matching']),
  c('rolling-hash', 'string-matching', 'Rolling hash', 'Update a substring fingerprint efficiently; account for possible collisions.', ['187', '2156'], ['Rolling Hash'], ['hashing', 'strings']),
  c('palindromes', 'strings', 'Palindrome techniques', 'Compare mirrored positions or reuse information about smaller palindromes.', ['5', '647', '336', '1960', '125'], [], ['strings'], ['two-pointers', 'interval-dp']),
  c('parsing', 'strings', 'Parsing & expression evaluation', 'Track tokens, precedence, and nested expression contexts.', ['150', '224', '394', '227', '385', '726'], [], ['stack']),
  c('frequency-map', 'hashing', 'Frequency counting', 'Count occurrences and compare frequency signatures instead of individual orders.', ['242', '49', '1941', '1128', '2085', '383', '266', '347'], [], ['hashing']),
  c('complement-lookup', 'hashing', 'Complement & seen-value lookup', 'Ask what earlier value completes the current candidate.', ['1', '219', '1679', '1711', '2006', '1814', '1983', '1248', '170', '1010', '653'], [], ['hashing'], ['prefix-sums']),
  c('list-reversal', 'linked-list', 'Link reversal', 'Save the next node before reversing a link and advancing the traversal.', ['206', '92', '25', '2074', '2130', '143', '234'], [], ['linked-list']),
  c('list-merge', 'linked-list', 'Merging & dummy nodes', 'Maintain a result tail and reconnect the next selected node safely.', ['21', '23', '82', '2487', '86'], [], ['linked-list'], ['heap-merge']),
  c('list-design', 'linked-list', 'List-backed data structures', 'Combine node links with lookup tables to support efficient updates.', ['146', '460', '707', '725', '432'], [], ['linked-list', 'hashing']),

  c('stack', 'stack-queue', 'Stack / LIFO', 'Push and pop at one end so the most recent unfinished work resumes first.', ['20', '155', '735', '682', '844', '1047', '946', '1249', '636', '150', '71', '394'], ['Stack'], [], ['recursion', 'parsing']),
  c('queue', 'stack-queue', 'Queue / FIFO', 'Process waiting items in the order they arrived.', ['232', 'B10', '649', '225', '622', '641'], ['Queue'], [], ['bfs']),
  c('monotonic-stack', 'stack-queue', 'Monotonic stack', 'Discard dominated candidates while keeping unresolved values in order.', ['B14', '739', '84', '901', '1475', '907', '1944', '2104', '2866', '1856', '402', '496', '503'], ['Monotonic Stack'], ['stack']),
  c('monotonic-deque', 'stack-queue', 'Monotonic deque', 'Evict expired candidates at the front and dominated candidates at the back.', ['239', '862', '1438', '1696', '1425'], ['Monotonic Queue'], ['queue'], ['sliding-window']),
  c('binary-search', 'search-sort', 'Binary search', 'Maintain a search invariant and discard a half that cannot contain the answer.', ['B3', '704', '33', '34', '35', '153'], ['Binary Search'], ['arrays']),
  c('binary-answer', 'binary-search', 'Binary search on the answer', 'Search a monotonic feasibility condition instead of an explicit sorted array.', ['410', '875', '1011', '668', '719'], [], ['binary-search']),
  c('sorting', 'search-sort', 'Sorting algorithms', 'Build ordering through insertion, partitioning, or merging.', ['B13', '75', '148', '912', '147', '406'], ['Sorting'], ['arrays']),
  c('quickselect', 'search-sort', 'Quickselect & order statistics', 'Partition candidates and continue only in the side containing the desired rank.', ['215', '973', '378'], ['Quickselect'], ['sorting']),
  c('divide-conquer', 'recursion', 'Divide & combine', 'Solve independent smaller inputs and combine their returned results.', ['50', '241', '395', '108', '654', '105'], ['Divide and Conquer'], ['recursion']),
  c('tree-traversal', 'trees', 'Tree traversal orders', 'Choose when a node is processed relative to its children.', ['94', '144', '145', '589', '590', '637', '897', '690', '538', '545', '971'], [], ['trees'], ['dfs', 'bfs']),
  c('bst', 'trees', 'Binary search trees', 'Use the ordering invariant to search, insert, or validate a tree.', ['98', '230', '700', '701', '669', '783', '938', '99', '270', '285'], ['Binary Search Tree'], ['trees', 'binary-search']),
  c('tree-paths', 'trees', 'Tree paths & ancestors', 'Relate nodes through root paths, lowest common ancestors, and subtree answers.', ['112', '236', '124', '687', '606', '235', '257', '113'], [], ['trees']),
  c('trie', 'trees', 'Trie / prefix tree', 'Share character prefixes while distinguishing a full word from a prefix.', ['B7', '208', '211', '212', '648', '720', '820', '1032', '1268', '1804', '642', '425', '677'], ['Trie'], ['strings']),
  c('heap-top-k', 'heaps', 'Top-k & bounded heaps', 'Keep only the candidates needed for a ranking or selection query.', ['215', '347', '630', '857', '871', '2208', '2233', '692', '703', '1985'], [], ['heaps']),
  c('heap-merge', 'heaps', 'K-way merging', 'Keep one frontier item per sorted source and repeatedly choose the smallest.', ['23', '373', '786', '632', '378', '313'], [], ['heaps'], ['list-merge']),
  c('two-heaps', 'heaps', 'Two heaps & streaming median', 'Balance the lower and upper halves so their boundary reveals the median.', ['295', '480', '2163', '2102'], [], ['heaps']),

  c('bfs', 'graphs', 'Breadth-first search', 'Explore one frontier layer at a time; unweighted distance grows by one per layer.', ['B10', '102', '1036', '733', '127', '847', '934', '103', '107', '429'], ['Breadth-First Search'], ['queue', 'graphs'], ['recursion']),
  c('multi-source-bfs', 'bfs', 'Multi-source BFS', 'Initialize every source at distance zero and expand one shared frontier.', ['994', '542', '286', '1162', '1765'], [], ['bfs']),
  c('dfs', 'graphs', 'Depth-first search', 'Finish one branch before returning; recursive and explicit-stack versions share this order.', ['104', '200', '797', '851', '695', '129', '257'], ['Depth-First Search'], ['stack', 'graphs'], ['recursion']),
  c('union-find', 'graphs', 'Union-find / disjoint sets', 'Track component representatives and merge sets without traversing all their members.', ['684', '547', '990', '737', '765', '947', '1319', '952', '685', '839', '1627', '305', '323', '721'], ['Union Find'], ['graphs']),
  c('dsu-compression', 'union-find', 'Path compression & union by size', 'Flatten parent paths and attach smaller component trees to larger ones.', ['684', '737', '947'], [], ['union-find']),
  c('dsu-rollback', 'union-find', 'Rollback DSU', 'Log union changes so earlier connectivity states can be restored.', [], [], ['union-find'], [], { source: 'graphs' }),
  c('topological-sort', 'graphs', 'Topological sorting', 'Remove dependency-free nodes or use DFS finishing order in a directed acyclic graph.', ['207', '210', '802', '269', '444', '1136'], ['Topological Sort'], ['graphs', 'queue']),
  c('bipartite', 'graphs', 'Bipartite coloring', 'Assign two colors so adjacent vertices differ, detecting odd-cycle conflicts.', ['785', '886'], [], ['bfs']),
  c('shortest-paths', 'advanced-graphs', 'Shortest-path algorithms', 'Choose the distance algorithm based on edge weights and query requirements.', ['743', '787', '882', '2203', '1334'], ['Shortest Path'], ['graphs'], ['bfs']),
  c('dijkstra', 'shortest-paths', 'Dijkstra', 'Finalize the smallest tentative distance when all edge weights are nonnegative.', ['743', '787', '882', '2203', '2093', '1976', '2065', '505', '499'], ['Dijkstra'], ['heaps', 'graphs']),
  c('zero-one-bfs', 'shortest-paths', '0–1 BFS', 'Use a deque to prioritize zero-cost edges before unit-cost edges.', ['1368', '2290'], [], ['bfs', 'queue'], [], { source: 'graphs' }),
  c('bellman-ford', 'shortest-paths', 'Bellman–Ford', 'Relax all edges repeatedly and detect reachable negative cycles.', ['787'], ['Bellman-Ford'], ['graphs'], [], { source: 'graphs' }),
  c('floyd-warshall', 'shortest-paths', 'Floyd–Warshall', 'Allow intermediate vertices one by one to compute all-pairs distances.', ['1334', '1462'], ['Floyd-Warshall'], ['graphs', 'dp'], [], { source: 'graphs' }),
  c('mst', 'advanced-graphs', 'Minimum spanning trees', 'Connect every vertex with minimum total edge weight without forming a cycle.', ['1584', '1135', '1168'], ['Minimum Spanning Tree'], ['graphs']),
  c('kruskal', 'mst', 'Kruskal', 'Process edges by weight and use DSU to reject edges inside one component.', ['1135', '1168', '1584'], [], ['union-find', 'sorting'], [], { source: 'graphs' }),
  c('prim', 'mst', 'Prim', 'Grow one connected tree using the cheapest edge across its boundary.', ['1584', '1168'], [], ['heaps', 'graphs'], [], { source: 'graphs' }),
  c('scc', 'advanced-graphs', 'Strongly connected components', 'Group directed vertices that can all reach each other, then form a condensation DAG.', [], ['Strongly Connected Component'], ['dfs'], [], { source: 'graphs' }),
  c('bridges', 'advanced-graphs', 'Bridges & articulation points', 'Track DFS discovery and low-link values to find connectivity-critical edges or vertices.', ['1192'], [], ['dfs'], [], { source: 'graphs' }),
  c('eulerian', 'advanced-graphs', 'Eulerian paths', 'Construct a walk that uses each edge exactly once.', ['332', '753', '2097'], ['Eulerian Circuit'], ['graphs', 'stack']),
  c('flow', 'advanced-graphs', 'Network flow & min-cut', 'Send flow through capacity-limited edges and reason about residual paths.', [], ['Maximum Flow'], ['bfs', 'dfs'], [], { source: 'graphs' }),
  c('matching', 'advanced-graphs', 'Bipartite matching', 'Find nonconflicting pairs using augmenting paths.', ['1820'], [], ['bipartite'], ['flow'], { source: 'graphs' }),

  c('subsets', 'backtracking', 'Subsets & combinations', 'Advance the starting choice to enumerate combinations without reordering duplicates.', ['78', '90', '39', '77', '2044', '1863', '1982'], [], ['backtracking']),
  c('permutations', 'backtracking', 'Permutations', 'Track which input choices are already used in the current ordering.', ['46', '47', '60', '526', '949'], [], ['backtracking']),
  c('constraints', 'backtracking', 'Constraint pruning', 'Stop a branch immediately when its partial assignment violates a rule.', ['51', '37', '79', '52', '842', '1307'], [], ['backtracking'], ['alpha-beta']),
  c('memoization', 'dp', 'Memoization / top-down DP', 'Cache an answer by state so repeated recursive subproblems do not run again.', ['139', '464', '329', '140', '377'], ['Memoization'], ['recursion']),
  c('linear-dp', 'dp', 'Linear & state-machine DP', 'Carry the best answer for each allowed state from one position to the next.', ['70', '198', '309', '1105', '1043', '634', '651', '790', '639', '91', '123', '213'], [], ['dp']),
  c('knapsack', 'dp', 'Knapsack family', 'Track a capacity or achievable total while choosing which items to take.', ['2915', '2585', '1981', '494', '322'], ['Knapsack'], ['dp'], [], { source: 'knapsack' }),
  c('knapsack-01', 'knapsack', '0/1 knapsack', 'Use each item at most once; descending capacity updates prevent accidental reuse.', ['416', '494', '2915', '1049', '805'], [], ['knapsack'], [], { source: 'knapsack' }),
  c('knapsack-unbounded', 'knapsack', 'Unbounded / complete knapsack', 'Allow unlimited copies; ascending capacity updates can reuse the current item.', ['322', '518'], [], ['knapsack'], [], { source: 'knapsack' }),
  c('knapsack-bounded', 'knapsack', 'Bounded / multiple knapsack', 'Limit the number of copies of each item; use grouped copies or an optimized transition.', ['2585'], [], ['knapsack-01'], [], { source: 'knapsack' }),
  c('knapsack-mixed', 'knapsack', 'Mixed knapsack', 'Combine item types with single-use, limited-use, and unlimited-use rules.', [], [], ['knapsack-01', 'knapsack-unbounded', 'knapsack-bounded'], [], { source: 'knapsack' }),
  c('knapsack-multidimensional', 'knapsack', 'Multidimensional knapsack', 'Track more than one resource limit in each DP state.', ['474', '1155', '879'], [], ['knapsack-01']),
  c('sequence-dp', 'dp', 'String & subsequence DP', 'Match, skip, or edit prefixes using answers for smaller positions.', ['1143', '72', '115', '300', '712', '1035', '1458', '97', '10', '44'], [], ['dp']),
  c('grid-dp', 'dp', 'Grid DP', 'Combine the permitted predecessor cells while treating boundaries and obstacles explicitly.', ['62', '63', '64', '174', '741', '931'], [], ['dp', 'matrix-traversal']),
  c('interval-dp', 'dp', 'Interval DP', 'Solve shorter ranges before comparing splits or endpoint choices in a larger range.', ['312', '375', '516', '664', '1000', '1130', '471', '546', '730'], [], ['dp']),
  c('tree-dp', 'dp', 'Tree DP', 'Combine child-state answers into a state for their parent.', ['337', '124', '333', '834', '968'], [], ['dp', 'trees']),
  c('bitmask-dp', 'dp', 'Bitmask / subset DP', 'Use a bitmask to encode the chosen set and transition by adding or removing elements.', ['464', '1986', '1799', '1879', '847'], ['Bitmask'], ['dp', 'bitmasks']),
  c('digit-dp', 'dp', 'Digit DP', 'Track position, bound tightness, and digit-related state while counting numbers.', ['233', '600', '902', '788'], [], ['dp']),
  c('probability-dp', 'dp', 'Probability DP', 'Combine weighted outcomes, keeping probability and expected-value states distinct.', ['688', '837', '808'], ['Probability and Statistics'], ['dp', 'probability']),

  c('merge-intervals', 'intervals', 'Merge & intersect intervals', 'Sort endpoints and distinguish touching, overlapping, and disjoint ranges.', ['56', '57', '729', '731', '715', '1288', '986', '252', '616'], [], ['intervals']),
  c('interval-scheduling', 'intervals', 'Interval scheduling', 'Choose compatible ranges with a justified ordering such as earliest finishing time.', ['435', '452', '757', '2054', '646'], [], ['intervals', 'greedy']),
  c('sweep-line', 'intervals', 'Sweep line', 'Process ordered boundary events while maintaining the currently active set.', ['253', '218', '732', '1094', '1109', '1943', '2015', '1851', '731', '850'], ['Line Sweep', 'Sweep Line'], ['intervals'], ['geometry', 'heaps']),
  c('greedy-exchange', 'greedy', 'Exchange & ordering arguments', 'Show that replacing an optimal solution choice with the greedy choice does not worsen it.', ['455', '406', '1029', '857'], [], ['greedy']),
  c('greedy-reach', 'greedy', 'Reachability & running balance', 'Maintain the furthest reachable frontier or reset when a partial choice becomes impossible.', ['55', '45', '134', '330'], [], ['greedy']),
  c('fenwick', 'range-query', 'Fenwick / binary indexed tree', 'Use low-bit jumps to update and query cumulative ranges efficiently.', ['307', '315', '2031', '2179', '3915', '308'], ['Binary Indexed Tree'], ['prefix-sums', 'bits']),
  c('segment-tree', 'range-query', 'Segment tree', 'Store interval summaries and combine only the segments needed for a query.', ['B6', '307', '2213', '699', '732', '308', '315'], ['Segment Tree'], ['arrays', 'recursion']),
  c('lazy-propagation', 'segment-tree', 'Lazy propagation', 'Defer whole-range updates while preserving correct node summaries.', ['699', '715', '732'], [], ['segment-tree']),
  c('sparse-table', 'range-query', 'Sparse table', 'Precompute power-of-two intervals for static queries such as range minimum.', ['1521'], [], ['arrays']),

  c('bit-operations', 'bits', 'Masks, shifts & set bits', 'Test, set, clear, and count bits while respecting integer width.', ['191', '190', '338', '137', '371', '476'], [], ['bits']),
  c('xor', 'bits', 'XOR cancellation & parity', 'Use XOR identities to cancel paired values or compare binary differences.', ['136', '260', '389', '1442', '1734', '1835'], [], ['bits']),
  c('bitmasks', 'bits', 'Bitmask sets & submask enumeration', 'Encode a small set as bits and enumerate its subsets or membership changes.', ['78', '401', '318', '864', '1371'], [], ['bits'], ['bitmask-dp']),
  c('bitwise-trie', 'bits', 'Bitwise trie', 'Choose binary branches to optimize XOR against previously stored numbers.', ['421', '1938'], [], ['bits', 'trie']),
  c('gcd', 'math', 'GCD & divisibility', 'Use remainders to reduce divisibility questions through the Euclidean algorithm.', ['B15', '365', '1250', '1979', '914'], [], ['math']),
  c('primes', 'math', 'Primes & sieve', 'Mark composite numbers or factor values to expose prime structure.', ['204', '650', '762', '866', '1175'], [], ['math']),
  c('modular', 'math', 'Modular arithmetic & exponentiation', 'Keep residues bounded and use repeated squaring for large exponents.', ['50', '372', '1922', '1015', '552'], [], ['math']),
  c('combinatorics', 'math', 'Combinatorics', 'Count arrangements or choices through combinations, recurrences, and symmetry.', ['62', '96', '118', '357', '1641', '1916'], ['Combinatorics'], ['math']),
  c('probability', 'math', 'Probability & expectation', 'Distinguish outcome probability from the expected value of a random variable.', ['470', '1227'], ['Probability and Statistics'], ['math']),
  c('geometry-orientation', 'geometry', 'Orientation, slopes & cross products', 'Use direction and signed area to compare points and detect collinearity.', ['149', '587', '469', '1037', '1232'], [], ['geometry']),
  c('geometry-rectangles', 'geometry', 'Rectangles, area & overlap', 'Combine coordinate bounds to detect intersections and account for shared area.', ['223', '391', '836', '850', '1401', '939'], [], ['geometry']),
  c('convex-hull', 'geometry', 'Convex hull', 'Maintain the outer boundary by rejecting turns that bend into the interior.', ['587'], [], ['geometry-orientation', 'sorting']),
  c('grid-simulation', 'simulation', 'Grid & cellular simulation', 'Read the old board consistently before committing simultaneous state changes.', ['289', '498'], [], ['simulation'], ['matrix-traversal']),
  c('robot-simulation', 'simulation', 'Movement & direction state', 'Track position, heading, and obstacles as commands update a moving agent.', ['657', '874', '1041', '2061'], [], ['simulation']),
  c('event-simulation', 'simulation', 'Event-driven simulation', 'Jump to the next meaningful event rather than iterating through every time tick.', ['621', '1834'], [], ['simulation', 'heaps']),
  c('minimax', 'games', 'Minimax', 'Alternate maximizing and minimizing choices assuming both players play optimally.', ['486', '464', '294', '375', '913'], ['Minimax'], ['recursion'], [], { source: 'games' }),
  c('alpha-beta', 'games', 'Alpha-beta pruning', 'Maintain lower and upper search bounds and skip branches that cannot affect the minimax decision.', [], [], ['minimax'], ['constraints'], { source: 'games', note: 'This is adversarial game-tree pruning. N-Queens constraint checks are not alpha-beta pruning.' }),
  c('nim-grundy', 'games', 'Nim & Sprague–Grundy', 'Analyze impartial games through winning states and XOR combinations of game values.', ['292'], [], ['xor'], [], { source: 'graphs' }),
];

export const CONCEPT_BY_ID = Object.fromEntries(LEARNING_CONCEPTS.map(item => [item.id, item]));
export const LEARNING_TOPICS = LEARNING_CONCEPTS.filter(item => !item.parent);
export function conceptPath(id) {
  const path = [];
  const visited = new Set();
  while (id && CONCEPT_BY_ID[id] && !visited.has(id)) {
    visited.add(id); path.unshift(id); id = CONCEPT_BY_ID[id].parent;
  }
  return path;
}
export function searchLearningCatalog(query) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return LEARNING_CONCEPTS.filter(item => words.every(word => `${item.id} ${item.title} ${item.summary} ${item.tags.join(' ')} ${conceptPath(item.id).map(id => CONCEPT_BY_ID[id].title).join(' ')}`.toLowerCase().includes(word)));
}
