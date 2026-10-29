// Next Permutation (LeetCode 31): rearrange nums in place into the next lexicographically greater permutation.
export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) throw new Error('Enter a JSON array of 1 to 100 integers.')
  if (!nums.every(value => Number.isInteger(value) && value >= 0 && value <= 100)) throw new Error('Each value must be an integer from 0 to 100.')
  return nums
}
export function buildTrace(input) {
  const nums = [...input]
  const n = nums.length
  const frames = []
  const snap = (phase, activeLine, extra, message) => frames.push({ phase, activeLine, nums: [...nums], message, ...extra })
  let i = n - 2
  snap('find-pivot', 2, { i, j: -1, swapJ: -1, reverseStart: -1 }, `Start with i = ${i}. Look for the rightmost index where nums[i] < nums[i+1].`)
  while (i >= 0 && nums[i] >= nums[i + 1]) {
    i--
    snap('find-pivot', 4, { i, j: -1, swapJ: -1, reverseStart: -1 },
      i >= 0 ? `Move left: now i = ${i}. The suffix to the right is still non-increasing.` : 'i reached -1: the whole array is non-increasing.')
  }
  if (i < 0) {
    nums.reverse()
    snap('reverse', 10, { i: -1, j: -1, swapJ: -1, reverseStart: 0 }, `No pivot: the array is fully descending, so the next permutation wraps. Reverse all of it.`)
    snap('done', 11, { i: -1, j: -1, swapJ: -1, reverseStart: -1 }, `Return [${nums.join(', ')}] (the smallest permutation).`)
    return { input, result: nums, frames }
  }
  snap('found-pivot', 5, { i, j: -1, swapJ: -1, reverseStart: -1 }, `Pivot found at i = ${i} (nums[i] = ${nums[i]} < nums[i+1] = ${nums[i + 1]}).`)
  let j = n - 1
  snap('found-swap', 6, { i, j, swapJ: -1, reverseStart: -1 }, `Start j at the end, index ${j}.`)
  while (nums[j] <= nums[i]) {
    j--
    snap('found-swap', 8, { i, j, swapJ: -1, reverseStart: -1 }, `nums[${j + 1}] is not larger than the pivot nums[${i}]; move j left to ${j}.`)
  }
  ;[nums[i], nums[j]] = [nums[j], nums[i]]
  snap('swapped', 9, { i, j, swapJ: j, reverseStart: -1 }, `Swap nums[${i}] and nums[${j}]: the suffix now has a smallest value larger than the pivot at the front.`)
  let lo = i + 1, hi = n - 1
  snap('reverse', 10, { i, j: -1, swapJ: -1, reverseStart: lo }, `Reverse the suffix after index ${i}; it was non-increasing, so it becomes the smallest arrangement.`)
  while (lo < hi) {
    ;[nums[lo], nums[hi]] = [nums[hi], nums[lo]]
    lo++; hi--
    if (lo < hi) snap('reverse', 10, { i, j: -1, swapJ: -1, reverseStart: i + 1 }, `Swap the ends of the suffix; the unfinished middle is indices ${lo}..${hi}.`)
  }
  snap('done', 11, { i, j: -1, swapJ: -1, reverseStart: -1 }, `Return [${nums.join(', ')}].`)
  return { input, result: nums, frames }
}
export const python = `def nextPermutation(nums):
    i = len(nums) - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1:] = reversed(nums[i + 1:])
    return nums`
export const code = [
  'FUNCTION nextPermutation(nums)',
  '    i = length(nums) - 2',
  '    WHILE i >= 0 AND nums[i] >= nums[i+1]',
  '        i = i - 1',
  '    IF i >= 0',
  '        j = length(nums) - 1',
  '        WHILE nums[j] <= nums[i]',
  '            j = j - 1',
  '        SWAP nums[i] and nums[j]',
  '    REVERSE nums from i+1 to the end',
  '    RETURN nums',
].map((text, index) => ({ line: index + 1, text }))
