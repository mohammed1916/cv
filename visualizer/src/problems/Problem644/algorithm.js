const ITERATIONS = 40

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.nums) || spec.nums.length < 1 || spec.nums.length > 30) throw new Error('Use 1 to 30 numbers.')
  if (spec.nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('Numbers are integers from -1000 to 1000.')
  if (!Number.isInteger(spec.k) || spec.k < 1 || spec.k > spec.nums.length) throw new Error('k must be from 1 to the number of values.')
  return spec
}

// Is there a subarray of length at least k whose average is at least `average`?
// Subtract `average` from each value; then some prefix sum must exceed a prefix sum at least k steps earlier.
function feasible(nums, k, average) {
  const prefix = [0]
  for (const v of nums) prefix.push(prefix.at(-1) + v - average)
  let lowest = Infinity
  for (let j = k; j < prefix.length; j++) {
    lowest = Math.min(lowest, prefix[j - k])
    if (prefix[j] - lowest >= 0) return true
  }
  return false
}

export function buildTrace(spec) {
  const { nums, k } = spec
  let lo = Math.min(...nums), hi = Math.max(...nums)
  const frames = [{ phase: 'start', activeLine: L('lo, hi = min'), lo, hi, mid: null, feasible: null, iteration: 0, message: `The answer lies between the smallest value ${lo} and the largest ${hi}. Binary search on the average.` }]
  for (let iteration = 1; iteration <= ITERATIONS; iteration++) {
    const mid = (lo + hi) / 2
    const ok = feasible(nums, k, mid)
    if (ok) lo = mid
    else hi = mid
    frames.push({
      phase: 'check', activeLine: L(ok ? 'lo = mid' : 'hi = mid'), lo, hi, mid, feasible: ok, iteration,
      message: ok
        ? `An average of at least ${mid.toFixed(4)} is reachable with length ≥ ${k}, so the answer is at least that.`
        : `No subarray of length ≥ ${k} averages ${mid.toFixed(4)} or more, so the answer is lower.`,
    })
  }
  return { input: spec, nums, result: lo, frames }
}

export const code = `def feasible(nums, k, average):
    prefix = [0]
    for v in nums:
        prefix.append(prefix[-1] + v - average)
    lowest = float('inf')
    for j in range(k, len(prefix)):
        lowest = min(lowest, prefix[j - k])
        if prefix[j] - lowest >= 0:
            return True
    return False

def findMaxAverage(nums, k):
    lo, hi = min(nums), max(nums)
    for _ in range(40):
        mid = (lo + hi) / 2
        if feasible(nums, k, mid):
            lo = mid
        else:
            hi = mid
    return lo`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
