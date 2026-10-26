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

export const code = `def findErrorNums(nums):
    counts = [0] * (len(nums) + 1)
    for v in nums: counts[v] += 1
    dup = next(v for v in range(1, len(nums) + 1) if counts[v] == 2)
    missing = next(v for v in range(1, len(nums) + 1) if counts[v] == 0)
    return [dup, missing]`.split('\n').map((text, index) => ({ line: index + 1, text }))
