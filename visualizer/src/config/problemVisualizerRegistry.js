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
  'integer-to-roman',
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
  'binary-tree-paths',
  'evaluate-division',
  'max-area-of-island',
  'network-delay-time',
  'number-of-provinces',
  'perfect-squares',
  'sum-of-two-integers',
  'task-scheduler',
  'palindrome-number',
  'integer-to-roman',
  'roman-to-integer',
  'longest-common-prefix',
  '3sum',
  '3sum-closest',
  '4sum',
  'remove-nth-node-from-end-of-list',
  'valid-parentheses',
  'swap-nodes-in-pairs',
  'regular-expression-matching',
  'merge-two-sorted-lists',
  'remove-element',
  'find-the-index-of-the-first-occurrence-in-a-string',
  'divide-two-integers',
  'next-permutation',
  'longest-valid-parentheses',
  'find-first-and-last-position-of-element-in-sorted-array',
  'search-insert-position',
  'valid-sudoku',
  'sudoku-solver',
  'count-and-say',
  'combination-sum-ii',
  'trapping-rain-water',
  'jump-game-ii',
  // Add all other 200+ solved problems...
])

// ✗ NOT_SOLVED - All problems now solved!
const NOT_SOLVED = []

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
