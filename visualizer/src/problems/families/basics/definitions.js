import { binarySearchSteps, BINARY_SEARCH_CODE } from '../../../algorithms/shared/binarySearch.js';
import { histogramSteps, HISTOGRAM_CODE } from '../../../algorithms/shared/histogram.js';
import { linearSearch, lowerBound, heapOperations, segmentTree, trieLookup, prefixSums, breadthFirstSearch } from '../../../algorithms/shared/basics.js';

import { extendedBuilders, extendedCodes, extendedLessons, validateExtended } from './extendedDefinitions.js';

const codes = {
  ...extendedCodes,
  linear: `def linear_search(nums, target):
    for i, value in enumerate(nums):
        if value == target:
            return i
    return -1`,
  lower: `def lower_bound(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left`,
  heap: `import heapq
def heap_operations(operations):
    heap, output = [], []
    for op in operations:
        if op[0] == 'push':
            heapq.heappush(heap, op[1])  # sift up
        else:
            output.append(heapq.heappop(heap) if heap else None)  # sift down
    return output`,
  segment: `def segment_tree(nums, operations):
    tree = [0] * (4 * len(nums))
    def build(v, lo, hi):
        if lo == hi:
            tree[v] = nums[lo]; return
        mid = (lo + hi) // 2
        build(2*v, lo, mid)
        build(2*v+1, mid+1, hi)
        tree[v] = tree[2*v] + tree[2*v+1]
    def query(v, lo, hi, left, right):
        if right < lo or hi < left:
            return 0
        if left <= lo and hi <= right: return tree[v]
        mid = (lo + hi) // 2
        return query(2*v, lo, mid, left, right) + query(2*v+1, mid+1, hi, left, right)
    def update(v, lo, hi, index, value):
        if lo == hi:
            tree[v] = value; return
        mid = (lo + hi) // 2
        if index <= mid: update(2*v, lo, mid, index, value)
        else: update(2*v+1, mid+1, hi, index, value)
        # Only ancestors of the changed leaf need recomputing.
        tree[v] = tree[2*v] + tree[2*v+1]
    build(1, 0, len(nums)-1); output = []
    for op, a, b in operations:
        if op == 'set': update(1, 0, len(nums)-1, a, b)
        else: output.append(query(1, 0, len(nums)-1, a, b))
    return output`,
  trie: `def trie_lookup(words, query):
    root = {}
    for word in words:
        node = root
        for char in word:
            node = node.setdefault(char, {})
        node['end'] = True
    node = root
    for char in query:
        if char not in node:
            return {'prefix': False, 'word': False}
        node = node[char]
    return {'prefix': True, 'word': node.get('end', False)}`,
  prefix: `def prefix_sums(nums, queries):
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] + value)
    output = []
    for left, right in queries:
        output.append(prefix[right+1] - prefix[left])
    return output`,
  bfs: `from collections import deque
def breadth_first_search(n, edges, start):
    graph = [[] for _ in range(n)]
    for a, b in edges: graph[a].append(b); graph[b].append(a)
    distance = [None] * n
    distance[start] = 0
    queue = deque([start])
    while queue:
        vertex = queue.popleft()
        for neighbor in graph[vertex]:
            if distance[neighbor] is not None: continue
            distance[neighbor] = distance[vertex] + 1
            queue.append(neighbor)
    return distance`,
};

export const lessons = {
  ...extendedLessons,
  linear: { number: 'B2', title: 'Linear Search: Inspect Every Candidate', slug: 'basics-linear-search', tags: ['Search', 'Array'],
    goal: 'Find the first matching index in an unsorted array.', strategy: 'Every position before the current index has been checked and cannot be the answer. Linear search needs no sorting.', complexity: 'O(n) time; O(1) auxiliary algorithm state.',
    examples: [['Match late', { nums: [8, 3, 11, 2, 7], target: 7 }], ['First duplicate', { nums: [4, 2, 4], target: 4 }], ['Not present', { nums: [9, -2, 5], target: 0 }], ['Empty array', { nums: [], target: 3 }]] },
  binary: { number: 'B3', title: 'Binary Search: Halve the Search Space', slug: 'basics-binary-search', tags: ['Search', 'Binary Search'],
    goal: 'Find a target in a sorted array by shrinking an inclusive interval.', strategy: 'Sorted order justifies discarding half the candidates. Keep left and right inclusive; stop when left exceeds right. With duplicates, any matching index is valid.', complexity: 'O(log n) time; O(1) auxiliary algorithm state.',
    examples: [['Several halvings', { nums: [-8, -3, 0, 4, 7, 12, 19, 25], target: 19 }], ['Absent between values', { nums: [1, 4, 7, 10], target: 6 }], ['Single value', { nums: [5], target: 5 }], ['Empty array', { nums: [], target: 2 }]] },
  lower: { number: 'B4', title: 'Lower Bound: Find the First Valid Position', slug: 'basics-lower-bound', tags: ['Search', 'Binary Search'],
    goal: 'Find the first index with value at least the target, including an insertion point at n.', strategy: 'Maintain a half-open interval [left, right). Values before left are too small; right is a possible boundary. Equality moves right leftward to find the first duplicate.', complexity: 'O(log n) time; O(1) auxiliary algorithm state.',
    examples: [['First duplicate', { nums: [1, 3, 3, 3, 8, 11], target: 3 }], ['Insert between', { nums: [2, 6, 10], target: 7 }], ['Past the end', { nums: [1, 2], target: 8 }], ['Empty boundary', { nums: [], target: 4 }]] },
  heap: { number: 'B5', title: 'Min-Heap: Insert and Extract', slug: 'basics-min-heap', tags: ['Heap', 'Priority Queue'],
    goal: 'Maintain a priority queue while observing sift-up and sift-down.', strategy: 'The array is a complete binary tree: children of i are 2i+1 and 2i+2. Each parent is no greater than its children. This guarantees only the minimum at the root, not a globally sorted array.', complexity: 'O(log n) per push/pop; O(n) storage. The trace exposes the sift operations inside Python heapq.',
    examples: [['Repair both directions', { operations: [['push', 9], ['push', 4], ['push', 7], ['push', 1], ['pop'], ['push', 3], ['pop']] }], ['Duplicate priorities', { operations: [['push', 2], ['push', 2], ['pop'], ['pop']] }], ['Empty pop', { operations: [['pop']] }], ['Negative priority', { operations: [['push', 0], ['push', -5], ['pop']] }]] },
  segment: { number: 'B6', title: 'Segment Tree: Query and Update Ranges', slug: 'basics-segment-tree', tags: ['Segment Tree', 'Range Query'],
    goal: 'Answer inclusive range sums after point assignments.', strategy: 'Every node stores the sum of its inclusive interval. A query skips disjoint nodes, accepts fully covered nodes, and splits partial overlaps. An update changes one leaf and its ancestors.', complexity: 'O(n) build and storage; O(log n) per point update or range-sum query.',
    examples: [['Query, change, query', { nums: [3, 1, 4, 1, 5, 9], operations: [['sum', 1, 4], ['set', 2, 8], ['sum', 1, 4]] }], ['Full range', { nums: [2, -3, 7], operations: [['sum', 0, 2]] }], ['One leaf', { nums: [5], operations: [['sum', 0, 0], ['set', 0, -2], ['sum', 0, 0]] }], ['Endpoints', { nums: [8, 4, 2, 1], operations: [['sum', 0, 0], ['sum', 3, 3]] }]] },
  trie: { number: 'B7', title: 'Trie: Share Prefixes, Find Words', slug: 'basics-trie', tags: ['Trie', 'String'],
    goal: 'Build a prefix tree and distinguish exact-word lookup from prefix lookup.', strategy: 'Each edge consumes one character. Terminal markers distinguish a word from a shared prefix. A missing edge disproves both prefix and exact matches.', complexity: 'O(total inserted characters + query length) time and O(total inserted characters) storage.',
    examples: [['Shared paths', { words: ['car', 'cart', 'cat', 'dog'], query: 'cart' }], ['Prefix, not a word', { words: ['stone', 'stop'], query: 'sto' }], ['Missing edge', { words: ['cat', 'car'], query: 'can' }], ['Duplicate word', { words: ['a', 'a', 'ab'], query: 'a' }]] },
  histogram: { number: 'B8', title: 'Histogram: Monotonic Stack Rectangles', slug: 'basics-histogram', tags: ['Stack', 'Monotonic Stack'],
    goal: 'Find the largest rectangle made of contiguous histogram bars.', strategy: 'The stack stores nondecreasing heights and their earliest valid starts. A shorter bar closes taller rectangles; their widths are now known. Unclosed rectangles extend to the end.', complexity: 'O(n) time: every bar enters and leaves the stack once. O(n) stack space.',
    examples: [['A valley closes rectangles', { heights: [2, 1, 5, 6, 2, 3] }], ['Equal bars', { heights: [4, 4, 4] }], ['Increasing heights', { heights: [1, 2, 3, 4] }], ['Zero separates runs', { heights: [3, 0, 3] }]] },
  prefix: { number: 'B9', title: 'Prefix Sums: Two Reads per Range', slug: 'basics-prefix-sums', tags: ['Array', 'Prefix Sum'],
    goal: 'Precompute running sums to answer static inclusive range queries.', strategy: 'prefix[i] stores the sum before index i. Subtract prefix[left] from prefix[right+1] to cancel values outside the query. Negative values work too; prefix sums need not increase.', complexity: 'O(n) preprocessing and storage; O(1) per query. Use a segment tree when updates are frequent.',
    examples: [['Overlapping ranges', { nums: [3, -2, 7, 4, 1], queries: [[0, 2], [1, 4], [3, 3]] }], ['Negative total', { nums: [-5, 2, -4], queries: [[0, 2]] }], ['Single item', { nums: [8], queries: [[0, 0]] }], ['Empty input', { nums: [], queries: [] }]] },
  bfs: { number: 'B10', title: 'Breadth-First Search: Explore in Layers', slug: 'basics-breadth-first-search', tags: ['Graph', 'Breadth-First Search'],
    goal: 'Compute shortest edge-count distances from a start vertex in an undirected unweighted graph.', strategy: 'A FIFO queue processes vertices in nondecreasing distance. Mark a vertex when it enters the queue so cycles and repeated edges do not schedule it twice.', complexity: 'O(V + E) time and O(V + E) adjacency/queue storage.',
    examples: [['Branching layers', { n: 7, edges: [[0, 1], [0, 2], [1, 3], [2, 4], [4, 5]], start: 0 }], ['Cycle', { n: 3, edges: [[0, 1], [1, 2], [2, 0]], start: 1 }], ['Single vertex', { n: 1, edges: [], start: 0 }], ['Disconnected', { n: 4, edges: [[0, 1], [2, 3]], start: 2 }]] },
};

const need = (condition, message) => { if (!condition) throw new Error(message); };
const integer = (value, min = -10000, max = 10000) => Number.isSafeInteger(value) && value >= min && value <= max;
function vector(value, minLength = 0, maxLength = 24) { return Array.isArray(value) && value.length >= minLength && value.length <= maxLength && value.every(v => integer(v)); }
export function parseBasics(key, text) {
  const input = JSON.parse(text);
  need(input && typeof input === 'object' && !Array.isArray(input), 'Use a JSON object.');
  validateExtended(key, input);
  if (['linear', 'binary', 'lower', 'prefix', 'segment'].includes(key)) need(vector(input.nums, key === 'segment' ? 1 : 0, key === 'segment' ? 16 : 24), 'nums must contain 0–24 integers between -10000 and 10000 (segment tree: 1–16).');
  if (['linear', 'binary', 'lower'].includes(key)) need(integer(input.target), 'target must be an integer between -10000 and 10000.');
  if (['binary', 'lower'].includes(key)) need(input.nums.every((v, i, a) => i === 0 || a[i - 1] <= v), 'Binary search needs sorted input. Put nums in nondecreasing order.');
  if (key === 'histogram') need(vector(input.heights) && input.heights.every(v => v >= 0), 'heights must contain 0–24 nonnegative integers, at most 10000 each.');
  if (['heap', 'segment'].includes(key)) {
    need(Array.isArray(input.operations) && input.operations.length <= 30, 'Use at most 30 operations.');
    for (const op of input.operations) {
      need(Array.isArray(op), 'Each operation must be an array.');
      if (key === 'heap') need((op[0] === 'push' && op.length === 2 && integer(op[1])) || (op[0] === 'pop' && op.length === 1), 'Use ["push", integer] or ["pop"].');
      else need(op.length === 3 && integer(op[1], 0, input.nums.length - 1) && ((op[0] === 'set' && integer(op[2])) || (op[0] === 'sum' && integer(op[2], op[1], input.nums.length - 1))), 'Use ["set", index, value] or ["sum", left, right] with valid inclusive bounds.');
    }
  }
  if (key === 'trie') {
    need(Array.isArray(input.words) && input.words.length <= 8 && input.words.every(w => typeof w === 'string' && /^[a-z]{1,8}$/.test(w)), 'Use at most eight lowercase words, each 1–8 letters.');
    need(typeof input.query === 'string' && /^[a-z]{1,8}$/.test(input.query), 'query must contain 1–8 lowercase letters.');
  }
  if (key === 'prefix') need(Array.isArray(input.queries) && input.queries.length <= 16 && input.queries.every(q => Array.isArray(q) && q.length === 2 && integer(q[0], 0, input.nums.length - 1) && integer(q[1], q[0], input.nums.length - 1)), 'Use at most 16 [left, right] queries within nums, left <= right.');
  if (key === 'bfs') {
    need(integer(input.n, 1, 10) && integer(input.start, 0, input.n - 1), 'Use 1–10 vertices, numbered 0 to n-1, and a valid start.');
    need(Array.isArray(input.edges) && input.edges.length <= 30 && input.edges.every(e => Array.isArray(e) && e.length === 2 && e.every(v => integer(v, 0, input.n - 1))), 'Use at most 30 edges [from, to] with valid vertex numbers.');
  }
  return input;
}

const builders = { linear: linearSearch, lower: lowerBound, heap: heapOperations, segment: segmentTree, trie: trieLookup, prefix: prefixSums, bfs: breadthFirstSearch,
  ...extendedBuilders,
  binary: input => { const frames = binarySearchSteps(input.nums, input.target); return { input, frames, result: frames.at(-1).foundIndex }; },
  histogram: input => { const frames = histogramSteps(input.heights); return { input, frames, result: frames.at(-1).best }; },
};
export function createBasicsDefinition(key) {
  const lesson = lessons[key];
  const code = key === 'binary' ? BINARY_SEARCH_CODE : key === 'histogram' ? HISTOGRAM_CODE : codes[key].split('\n').map((text, i) => ({ line: i + 1, text }));
  const examples = lesson.examples.map(([label, input]) => ({ label, input: JSON.stringify(input) }));
  return { ...lesson, code, examples,
    python: code.map(line => line.text).join('\n'),
    pythonStages: Object.fromEntries(code.map(line => [`line${line.line}`, line.line])),
    inputLabel: `Input JSON · ${Object.keys(JSON.parse(examples[0].input)).join(', ')}`,
    phases: [{ id: 'start', label: 'Set up' }, { id: 'inspect', label: 'Inspect' }, { id: 'update', label: 'Update' }, { id: 'done', label: 'Return' }],
    parse: text => parseBasics(key, text),
    build: input => {
      const run = builders[key](input);
      if (run.frames.length === 1) run.frames.unshift({ ...run.frames[0], activeLine: 3, message: 'The initial search interval is empty; there are no candidates.' });
      run.frames = run.frames.map((frame, index) => ({ ...frame,
        codeStage: `line${frame.activeLine}`,
        phase: index === run.frames.length - 1 ? 'done' : index === 0 ? 'start' : ['update', 'update_left', 'update_right', 'push', 'pop', 'finalize'].includes(frame.phase) ? 'update' : 'inspect',
      }));
      return run;
    },
  };
}
