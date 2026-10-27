export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.m) || !Number.isInteger(input.k)) throw new Error('Use an object with an integer array nums and integers m and k.')
  if (input.nums.length < 1 || input.nums.length > 40) throw new Error('nums must have 1 to 40 entries.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each entry of nums is an integer from 1 to 100.')
  if (input.k < 1 || input.k > input.nums.length) throw new Error('k must be from 1 up to the length of nums.')
  if (input.m < 1 || input.m > input.k) throw new Error('m must be from 1 up to k.')
  return { nums: input.nums, m: input.m, k: input.k }
}

export function buildTrace({ nums, m, k }) {
  const frames = []
  const tally = new Map()
  let window = 0
  let best = 0
  frames.push({ phase: 'start', activeLine: L('set best to 0'), left: 0, right: -1, window, distinct: 0, best, message: `Look for windows of length ${k} with at least ${m} distinct values.` })
  for (let right = 0; right < nums.length; right++) {
    tally.set(nums[right], (tally.get(nums[right]) || 0) + 1)
    window += nums[right]
    frames.push({ phase: 'add', activeLine: L('add nums[right]'), left: Math.max(0, right - k + 1), right, window, distinct: tally.size, best, message: `Add ${nums[right]} to the window.` })
    if (right >= k) {
      const old = nums[right - k]
      window -= old
      tally.set(old, tally.get(old) - 1)
      if (tally.get(old) === 0) tally.delete(old)
      frames.push({ phase: 'remove', activeLine: L('remove nums[right minus k]'), left: right - k + 1, right, window, distinct: tally.size, best, message: `Remove ${old} from the front, so the window keeps length ${k}.` })
    }
    if (right >= k - 1 && tally.size >= m) {
      best = Math.max(best, window)
      frames.push({ phase: 'check', activeLine: L('the larger of best'), left: right - k + 1, right, window, distinct: tally.size, best, message: `This window has ${tally.size} distinct values and sums to ${window}. Best: ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), left: 0, right: nums.length - 1, window, distinct: tally.size, best, message: `Largest sum with enough distinct values: ${best}.` })
  return { input: { nums, m, k }, result: best, frames }
}

export const code = `maximum sum of almost unique subarray (nums, m, k):
  set best to 0
  set tally to empty and window sum to 0
  for each position right in nums
    add nums[right] to the tally and the window sum
    if right is at least k then remove nums[right minus k] from the tally and the window sum
    if right is at least k minus 1 and the tally has at least m distinct values then
      set best to the larger of best and the window sum
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_sum_almost_unique(nums, m, k):
    best = 0
    tally = {}
    window = 0
    for right, value in enumerate(nums):
        tally[value] = tally.get(value, 0) + 1
        window += value
        if right >= k:
            old = nums[right - k]
            window -= old
            tally[old] -= 1
            if tally[old] == 0:
                del tally[old]
        if right >= k - 1 and len(tally) >= m:
            best = max(best, window)
    return best
`
