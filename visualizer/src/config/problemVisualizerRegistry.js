/**
 * PROBLEM VISUALIZER REGISTRY
 *
 * Central source of truth for which LeetCode problems have visualizers.
 * Visual at a glance: SOLVED (✓) vs NOT_SOLVED (✗)
 */

// ✓ SOLVED - Problems with custom DockableWorkspace visualizers
const SOLVED_SLUGS = new Set([
  'two-sum',
  'add-two-numbers',
  'longest-substring-without-repeating-characters',
  'median-of-two-sorted-arrays',
  'longest-palindromic-substring',
  'zigzag-conversion',
  'reverse-integer',
  'string-to-integer-atoi',
  'container-with-most-water',
  'merge-k-sorted-lists',
  'generate-parentheses',
  'merge-intervals',
  'insert-interval',
  'search-in-rotated-sorted-array',
  'combination-sum',
  'permutations',
  'rotate-image',
  'word-search',
  'remove-duplicates-from-sorted-array',
  'reverse-linked-list',
  'reverse-nodes-in-k-group',
  'wildcard-matching',
  'jump-game-ii',
  'largest-rectangle-in-histogram',
  'maximal-rectangle',
  'minimum-window-substring',
  'distinct-subsequences',
  'best-time-to-buy-and-sell-stock',
  'best-time-to-buy-and-sell-stock-ii',
  'best-time-to-buy-and-sell-stock-iii',
  'best-time-to-buy-and-sell-stock-iv',
  'best-time-to-buy-and-sell-stock-with-cooldown',
  'gas-station',
  'happy-number',
  'single-number',
  'sort-colors',
  'pascals-triangle',
  'reverse-string',
  'rotate-array',
  'climbing-stairs',
  'permutation-in-string',
  'burst-balloons',
  'letter-combinations-of-a-phone-number',
  'redundant-connection',
  'maximum-product-subarray',
  'insert-delete-getrandom-o1-duplicates-allowed',
  'search-a-2d-matrix',
  'length-of-last-word',
  'counting-bits',
  'merge-sorted-array',
  'distinct-subsequences',
  'sort-list',
  'reorder-list',
  'find-all-anagrams-in-a-string',
  'kth-largest-element-in-an-array',
  'accounts-merge',
  'binary-search-tree-iterator',
  'koko-eating-bananas',
  // Add all other 200+ solved problems...
])

// ✗ NOT_SOLVED - Problems still needing visualizers
const NOT_SOLVED = [
  { number: '257', title: 'Binary Tree Paths', slug: 'binary-tree-paths', difficulty: 'Easy', tags: ['Tree', 'DFS'] },
  { number: '399', title: 'Evaluate Division', slug: 'evaluate-division', difficulty: 'Medium', tags: ['Graph', 'DFS'] },
  { number: '695', title: 'Max Area of Island', slug: 'max-area-of-island', difficulty: 'Medium', tags: ['Graph', 'BFS'] },
  { number: '743', title: 'Network Delay Time', slug: 'network-delay-time', difficulty: 'Medium', tags: ['Graph', 'Dijkstra'] },
  { number: '547', title: 'Number of Provinces', slug: 'number-of-provinces', difficulty: 'Medium', tags: ['Union-Find', 'Graph'] },
  { number: '279', title: 'Perfect Squares', slug: 'perfect-squares', difficulty: 'Medium', tags: ['DP', 'Math'] },
  { number: '371', title: 'Sum of Two Integers', slug: 'sum-of-two-integers', difficulty: 'Medium', tags: ['Bit Manipulation'] },
  { number: '621', title: 'Task Scheduler', slug: 'task-scheduler', difficulty: 'Medium', tags: ['Greedy', 'Array'] },
]

/**
 * Check if a problem has a visualizer (SOLVED)
 */
export function isProblemSolved(slug) {
  return SOLVED_SLUGS.has(slug)
}

/**
 * Get list of all unsolved problems
 */
export function getUnsolvedProblems() {
  return NOT_SOLVED
}

/**
 * Get registry statistics
 */
export function getRegistryStats() {
  return {
    totalSolved: SOLVED_SLUGS.size,
    totalUnsolved: NOT_SOLVED.length,
    percentSolved: Math.round((SOLVED_SLUGS.size / (SOLVED_SLUGS.size + NOT_SOLVED.length)) * 100),
    unsolvedProblems: NOT_SOLVED,
  }
}

/**
 * Get all solved problem slugs
 */
export function getSolvedSlugs() {
  return Array.from(SOLVED_SLUGS)
}
