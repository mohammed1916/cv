export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || v < 1 || v > nums.length)) throw new Error('Enter a JSON array of 2–10,000 integers, each from 1 to n.')
  const counts = Array(nums.length + 1).fill(0)
  for (const v of nums) counts[v]++
  if (!counts.some(c => c === 2) || counts.filter((c, i) => i && c === 0).length !== 1) throw new Error('The array must be a permutation of 1..n with exactly one value repeated and one missing.')
  return nums
}

// Count occurrences; the value seen twice is the duplicate, the value seen zero times is missing.
export function buildTrace(nums) {
  const n = nums.length
  const counts = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', index: -1, counts: [...counts], activeLine: 2, message: 'Count how many times each value 1..n appears.' }]
  let duplicate = null
  for (let i = 0; i < n; i++) {
    counts[nums[i]]++
    if (counts[nums[i]] === 2) duplicate = nums[i]
    frames.push({ phase: 'count', index: i, value: nums[i], counts: [...counts], duplicate, activeLine: 4, message: `Count ${nums[i]} → ${counts[nums[i]]}.` })
  }
  let missing = null
  for (let v = 1; v <= n; v++) if (counts[v] === 0) missing = v
  const result = [duplicate, missing]
  frames.push({ phase: 'done', index: n, counts: [...counts], duplicate, missing, result, activeLine: 7, message: `Duplicate ${duplicate}, missing ${missing}.` })
  return { input: nums, result, frames }
}

export const code = `count[1..n] = 0; duplicate = none
for each value in nums:
  increase count[value] by one
  if count[value] has just become 2, record value as duplicate
find the slot in 1..n whose count is still zero
return [duplicate, missing slot]`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The sequence-family trace uses activeLine 1 (setup), 4 (per-value update), 3 (missing slot search), 5 (return).
export const LINE_MAP = { 1: 1, 3: 5, 5: 6 }

export function familyLine(frame) {
  if (frame.phase === 'update') return frame.message.endsWith('appeared 2 time(s).') ? 4 : 3
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_error_nums(nums):
    n = len(nums)
    count = [0] * (n + 1)
    duplicate = None
    for value in nums:
        count[value] += 1
        if count[value] == 2:
            duplicate = value
    missing = next(slot for slot in range(1, n + 1) if count[slot] == 0)
    return [duplicate, missing]`
