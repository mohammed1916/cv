export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 10 || !nums.every(x => Number.isInteger(x) && x >= -9 && x <= 9)) throw new Error('nums has 1 to 10 integers from -9 to 9.')
  return { nums }
}

// Kadane over the values that survive a removal; original indices are kept so the picture can highlight them.
export function bestSubarray(nums, removed) {
  let best = null
  let current = null
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === removed) continue
    if (current === null || current.sum < 0) current = { sum: nums[i], start: i, end: i }
    else { current.sum += nums[i]; current.end = i }
    if (best === null || current.sum > best.sum) best = { ...current }
  }
  return best
}

export function buildTrace({ nums }) {
  const frames = []
  const candidates = [...new Set(nums)].sort((a, b) => a - b)
  let best = bestSubarray(nums, null)
  let bestRemoved = null
  frames.push({ pythonLine: P('best = kadane'), phase: 'keep', activeLine: L('keep everything'), at: -1, removed: null, window: best, best, message: `Without removing anything, the best subarray sum is ${best.sum}.` })
  for (const x of candidates) {
    if (nums.every(v => v === x)) continue
    const candidate = bestSubarray(nums, x)
    frames.push({ pythonLine: P('for x in'), phase: 'try', activeLine: L('for each value x'), at: -1, removed: x, window: candidate, best, message: `Remove every ${x}: best subarray sum ${candidate.sum}.` })
    if (candidate.sum > best.sum) {
      best = candidate
      bestRemoved = x
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return the largest'), at: -1, removed: bestRemoved, window: best, best, result: best.sum, message: `Maximum subarray sum is ${best.sum}.` })
  return { input: { nums }, result: best.sum, frames }
}

export const code = `maximum subarray sum after removing all occurrences of at most one value
  best = largest subarray sum of nums
  for each distinct value x that is not the whole array
    best = max(best, largest subarray sum with every x skipped)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_after_removal(nums):
    best = kadane(nums, None)
    for x in set(nums):
        if all(v == x for v in nums):
            continue
        best = max(best, kadane(nums, x))
    return best`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
