import { twoPointers, slidingWindow, insertionSort, nextGreater, euclideanGcd } from '../../../algorithms/shared/basicsExtended.js';

export const extendedBuilders = { pair: twoPointers, window: slidingWindow, insertion: insertionSort, greater: nextGreater, gcd: euclideanGcd };
export const extendedCodes = {
  pair: `def two_pointers(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target: return [left, right]
        if total < target: left += 1
        else: right -= 1
    return None`,
  window: `def sliding_window(nums, k):
    total, best = 0, None
    for right, value in enumerate(nums):
        total += value
        if right >= k: total -= nums[right-k]
        if right >= k-1: best = total if best is None else max(best, total)
    return best`,
  insertion: `def insertion_sort(nums):
    for i in range(1, len(nums)):
        key, j = nums[i], i-1
        while j >= 0 and nums[j] > key:
            nums[j+1] = nums[j]
            j -= 1
        nums[j+1] = key
    return nums`,
  greater: `def next_greater(nums):
    stack, output = [], [None] * len(nums)
    for i, value in enumerate(nums):
        while stack and nums[stack[-1]] < value:
            output[stack.pop()] = value
        stack.append(i)
    return output`,
  gcd: `def gcd(a, b):
    while b != 0:
        remainder = a % b
        a, b = b, remainder
    return a`,
};

export const extendedLessons = {
  pair: { number: 'B11', title: 'Two Pointers: Find a Sorted Pair', slug: 'basics-two-pointers', tags: ['Array', 'Two Pointers'],
    goal: 'Find two distinct indices whose values sum to a target in a sorted array.',
    strategy: 'If the sum is too small, the left endpoint cannot work with any remaining partner. If it is too large, the right endpoint cannot work. Sorted order makes each discard safe.',
    complexity: 'O(n) time; O(1) auxiliary algorithm space. Any matching pair is valid.',
    examples: [['Move both ends', { nums: [-3, 0, 2, 4, 7, 11], target: 9 }], ['Equal values, distinct indices', { nums: [3, 3], target: 6 }], ['No pair', { nums: [1, 4, 8], target: 6 }], ['Empty array', { nums: [], target: 0 }]] },
  window: { number: 'B12', title: 'Sliding Window: Reuse a Running Sum', slug: 'basics-sliding-window', tags: ['Array', 'Sliding Window'],
    goal: 'Find the maximum sum of exactly k consecutive items.',
    strategy: 'Add the entering value and subtract the leaving value. After removal, the running sum covers only the current window. Update the best answer only for a complete window of k items.',
    complexity: 'O(n) time; O(1) auxiliary algorithm space. Negative totals are valid answers.',
    examples: [['Overlapping windows', { nums: [2, 1, 5, 1, 3, 2], k: 3 }], ['All negative', { nums: [-8, -3, -5, -2], k: 2 }], ['Whole array', { nums: [4, -1, 3], k: 3 }], ['Single-item windows', { nums: [2, 9, 1], k: 1 }]] },
  insertion: { number: 'B13', title: 'Insertion Sort: Grow a Sorted Prefix', slug: 'basics-insertion-sort', tags: ['Array', 'Sorting'],
    goal: 'Sort an array by inserting each new value into the already sorted prefix.',
    strategy: 'Hold the key outside the array while shifting larger values right. The hole marks where the key can be placed. Equal values are not shifted past one another, making the sort stable.',
    complexity: 'O(n²) worst-case time, O(n) on sorted input; O(1) auxiliary sorting space. Playback works on a copy to preserve the input.',
    examples: [['Several shifts', { nums: [7, 3, 5, 2, 4] }], ['Already sorted', { nums: [-2, 0, 3, 8] }], ['Duplicate keys', { nums: [3, 1, 3, 1] }], ['Empty array', { nums: [] }]] },
  greater: { number: 'B14', title: 'Next Greater Element: Resolve a Waiting Stack', slug: 'basics-next-greater', tags: ['Stack', 'Monotonic Stack'],
    goal: 'Find the first strictly greater value to the right of every array position.',
    strategy: 'Stack indices are unresolved, and their values are nonincreasing. A new larger value resolves smaller stack tops. They have waited until this first larger value, so it is their answer.',
    complexity: 'O(n) time because each index is pushed and popped at most once; O(n) stack and output space.',
    examples: [['Resolve several positions', { nums: [2, 1, 2, 4, 3] }], ['Decreasing values', { nums: [9, 6, 3, 1] }], ['Strictly greater, not equal', { nums: [2, 2, 3] }], ['Empty array', { nums: [] }]] },
  gcd: { number: 'B15', title: 'Euclidean Algorithm: Reduce by Remainders', slug: 'basics-euclidean-gcd', tags: ['Math', 'Number Theory'],
    goal: 'Compute the greatest common divisor of two nonnegative integers, at least one positive.',
    strategy: 'A divisor of both a and b also divides a mod b. Replacing (a, b) with (b, a mod b) preserves the gcd while the second value strictly decreases until zero.',
    complexity: 'O(log(max(a, b))) arithmetic steps; O(1) auxiliary algorithm space.',
    examples: [['Several divisions', { a: 252, b: 105 }], ['Coprime values', { a: 35, b: 12 }], ['Swap through a remainder', { a: 18, b: 48 }], ['Zero second input', { a: 27, b: 0 }]] },
};

export function validateExtended(key, input) {
  const need = (condition, message) => { if (!condition) throw new Error(message); };
  const integer = value => Number.isSafeInteger(value) && Math.abs(value) <= 10000;
  if (['pair', 'window', 'insertion', 'greater'].includes(key)) need(Array.isArray(input.nums) && input.nums.length <= 24 && input.nums.every(integer), 'nums must contain at most 24 integers between -10000 and 10000.');
  if (key === 'pair') {
    need(integer(input.target), 'target must be an integer between -10000 and 10000.');
    need(input.nums.every((value, i, nums) => i === 0 || nums[i - 1] <= value), 'Two-pointer pair search needs nums in nondecreasing order.');
  }
  if (key === 'window') need(Number.isInteger(input.k) && input.k >= 1 && input.k <= input.nums.length, 'k must be between 1 and nums.length; use a nonempty array.');
  if (key === 'gcd') need(integer(input.a) && integer(input.b) && input.a >= 0 && input.b >= 0 && input.a + input.b > 0, 'a and b must be integers from 0 to 10000, with at least one positive.');
}
