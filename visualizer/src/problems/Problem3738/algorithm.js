const MAX_LENGTH = 14
const MAX_VALUE = 20

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (arr.some(v => !Number.isInteger(v) || Math.abs(v) > MAX_VALUE)) throw new Error(`Values are integers from -${MAX_VALUE} to ${MAX_VALUE}.`)
  return arr
}

export const code = `longest non-decreasing subarray after one change(nums)
  set left to the run length of non-decreasing values ending at each position
  set right to the run length of non-decreasing values starting at each position
  set best to the longest of the left runs
  for each position i
    if i has a left neighbour
      consider the left run before i plus the changed value at i
    if i has a right neighbour
      consider the changed value at i plus the right run after i
    if i has both neighbours and the left neighbour is at most the right neighbour
      consider the left run, the changed value, and the right run together
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(nums) {
  const n = nums.length
  const left = Array(n).fill(1)
  for (let i = 1; i < n; i++) if (nums[i - 1] <= nums[i]) left[i] = left[i - 1] + 1
  const right = Array(n).fill(1)
  for (let i = n - 2; i >= 0; i--) if (nums[i] <= nums[i + 1]) right[i] = right[i + 1] + 1
  let best = Math.max(...left)
  const frames = [{ phase: 'start', index: -1, best, left: [...left], right: [...right], activeLine: L('set left to'), message: `Without any change, the longest non-decreasing subarray is ${best}.` }]
  for (let i = 0; i < n; i++) {
    let candidate = 1
    let line = L('for each position i')
    let note = 'Change this value alone.'
    if (i > 0) {
      candidate = Math.max(candidate, left[i - 1] + 1)
      line = L('if i has a left neighbour')
      note = `Extend the run ending at ${i - 1} by changing this value.`
    }
    if (i < n - 1) {
      candidate = Math.max(candidate, right[i + 1] + 1)
      line = L('if i has a right neighbour')
      note = `Extend the run starting at ${i + 1} by changing this value.`
    }
    if (i > 0 && i < n - 1 && nums[i - 1] <= nums[i + 1]) {
      const joined = left[i - 1] + 1 + right[i + 1]
      if (joined > candidate) {
        candidate = joined
        line = L('if i has both neighbours')
        note = `Join both runs by changing this value to a number between ${nums[i - 1]} and ${nums[i + 1]}.`
      }
    }
    best = Math.max(best, candidate)
    frames.push({ phase: 'scan', index: i, best, left: [...left], right: [...right], activeLine: line, message: `Position ${i}: best run ${candidate}. ${note} Overall best: ${best}.` })
  }
  frames.push({ phase: 'done', index: n, best, left: [...left], right: [...right], activeLine: L('return best'), message: `Longest non-decreasing subarray after at most one change: ${best}.` })
  return { input: nums, result: best, frames }
}

export const python = `def longest_non_decreasing_after_one_change(nums):
    n = len(nums)
    left = [1] * n
    for i in range(1, n):
        if nums[i - 1] <= nums[i]:
            left[i] = left[i - 1] + 1
    right = [1] * n
    for i in range(n - 2, -1, -1):
        if nums[i] <= nums[i + 1]:
            right[i] = right[i + 1] + 1
    best = max(left)
    for i in range(n):
        if i > 0:
            best = max(best, left[i - 1] + 1)
        if i < n - 1:
            best = max(best, right[i + 1] + 1)
        if 0 < i < n - 1 and nums[i - 1] <= nums[i + 1]:
            best = max(best, left[i - 1] + 1 + right[i + 1])
    return best
`
